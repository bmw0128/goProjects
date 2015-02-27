package patientGroups

import (
	"appengine"
	"appengine/datastore"
	"appengine/user"
	"net/http"
	"encoding/json"
	"strconv"
	//"io/ioutil"
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	"github.com/bmw0128/bmwpharm/clients"
	"github.com/bmw0128/bmwpharm/diseases"
)

type PatientGroup struct{
	Id string `json:"id"`
	Name string `json:"patientGroupName"`
	AssessmentValues []diseases.AssessmentValue `json:"assessmentValues"`
}

type PatientGroupTemp struct {
	Id string `json:"id"`
	Name string `json:"patientGroupName"`
	AssessmentValues []map[string]string `json:"assessments"`
}

func MakeMuxer(prefix string) http.Handler {

	var m *mux.Router

	// Pass through the prefix if we have one.
	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	m.HandleFunc("/", GetPatientGroups).Methods("GET")
	m.HandleFunc("/{id}/", GetPatientGroupById).Methods("GET")
	m.HandleFunc("/{id}/", DeletePatientGroup).Methods("DELETE")
	m.HandleFunc("/new", CreatePatientGroup).Methods("POST")
	m.HandleFunc("/edit", EditPatientGroup).Methods("POST")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

func EditPatientGroup(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {

		/*testing
		bytes, _ := ioutil.ReadAll(r.Body)
		c.Infof("*** edit bytes: " + string(bytes));
		//end testing
		*/

		defer r.Body.Close()

		var thePatientGroup PatientGroup
		//d := new(Drug)
		dec := json.NewDecoder(r.Body)
		dec.Decode(&thePatientGroup)

		stringId := thePatientGroup.Id

		c.Infof("*** PG to be edited: %v", stringId)

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		patientGroupKey := datastore.NewKey(c, "PatientGroup", "", entity_id_int, nil)
		//put in a transaction since may be updating disease name and assessment values
		err := datastore.RunInTransaction(c, func(c appengine.Context) error {

				_, err := datastore.Put(c, patientGroupKey, &thePatientGroup)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return err
				}

				q := datastore.NewQuery("AssessmentValue").Ancestor(patientGroupKey)
				var assessmentValues []diseases.AssessmentValue
				assessmentValuesKeys, error := q.GetAll(c, &assessmentValues)
				if error != nil {
					c.Errorf("error fetching AssessmentValue in EditPatientGroup: %v", error)
					return error
				}
				//delete all AssessmentsValues first
				for i, _ := range assessmentValues {
					assessmentValueKey := assessmentValuesKeys[i]
					err := datastore.Delete(c, assessmentValueKey)
					if err != nil{
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return err
					}
				}
				//add the new/edited AssessmentValues from the 'edit' page
				newAssessmentValueKey := datastore.NewIncompleteKey(c, "AssessmentValue", patientGroupKey)

				for _, av := range thePatientGroup.AssessmentValues {

					assessmentValue := &diseases.AssessmentValue{AssessmentId: av.AssessmentId, Operator: av.Operator, Value: av.Value}
					_, err := datastore.Put(c, newAssessmentValueKey, assessmentValue)
					if err != nil {
						c.Errorf("*** error saving a new AssessmentValue in EditPatientGroup: %v", err)
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return err
					}
				}
				return err
			}, nil)
		if err != nil {
			c.Errorf("Transaction failed in EditPatientGroup: %v", err)
			http.Error(w, "Internal Server Error", 500)
			return
		}
	}
}

func DeletePatientGroup(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		patientGroupKey := datastore.NewKey(c, "PatientGroup", "", entity_id_int, nil)

		err := datastore.RunInTransaction(c, func(c appengine.Context) error {

				q := datastore.NewQuery("AssessmentValue").Ancestor(patientGroupKey)
				var assessmentValues []diseases.AssessmentValue
				assessmentValuesKeys, error := q.GetAll(c, &assessmentValues)
				if error != nil {
					c.Errorf("error fetching AssessmentValue in DeletePatientGroup: %v", error)
					return error
				}
				//delete all AssessmentsValues first
				for i, _ := range assessmentValues {
					assessmentValueKey := assessmentValuesKeys[i]
					err := datastore.Delete(c, assessmentValueKey)
					if err != nil{
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return err
					}
				}
				//delete the Patient Group
				err := datastore.Delete(c, patientGroupKey)
				if err != nil{
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return err
				}
				return err
			}, nil)
		if err != nil {
			c.Errorf("Transaction failed  in DeletePatientGroup: %v", err)
			http.Error(w, "Internal Server Error", 500)
			return
		}
	}
}

func GetPatientGroupById(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "PatientGroup", "", entity_id_int, nil)

		q := datastore.NewQuery("PatientGroup").Filter("__key__ =", key)
		t := q.Run(c)
		var result PatientGroup

		for {
			_, err := t.Next(&result)
			result.Id= stringId
			if err == datastore.Done {

				q := datastore.NewQuery("AssessmentValue").Ancestor(key)
				var assessmentValues []diseases.AssessmentValue
				assessmentValuesKeys, error := q.GetAll(c, &assessmentValues)
				if error != nil {
					c.Errorf("error fetching AssessmentValue in GetDiseaseById: %v", error)
					break
				}

				for i, _ := range assessmentValues {
					assessmentValueKey := assessmentValuesKeys[i]
					id := strconv.FormatInt(assessmentValueKey.IntID(), 10)
					assessmentValues[i].Id= id
				}

				result.AssessmentValues= assessmentValues

				gorca.WriteJSON(c, w, r, result)
				break // No further entities match the query.
			}
			if err != nil {
				c.Errorf("error fetching next Disease in GetPatientGroupById: %v", err)
				break
			}
		}
	}
}

func CreatePatientGroup(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {

		//testing
		//bytes, _ := ioutil.ReadAll(r.Body)
		//c.Infof("*** patient group temp bytes: " + string(bytes));
		//end testing

		defer r.Body.Close()
		var patientGroupTemp PatientGroupTemp
		dec := json.NewDecoder(r.Body)
		dec.Decode(&patientGroupTemp)

		patientGroup := &PatientGroup{Name: patientGroupTemp.Name}

		newPatientGroupKey, err := datastore.Put(c, datastore.NewIncompleteKey(c, "PatientGroup", nil), patientGroup)
		if err != nil {
			c.Errorf("*** error saving PatientGroup: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		newAssessmentValueKey := datastore.NewIncompleteKey(c, "AssessmentValue", newPatientGroupKey)

		//'val' is a map
		for _, val := range patientGroupTemp.AssessmentValues {
			var assessmentId string
			var operator string
			var value string
			for aKey, _ := range val{
				if(aKey == "assessmentId"){
					assessmentId= val[aKey]
				}else if(aKey == "operator"){
					operator= val[aKey]
				}else if(aKey == "value"){
					value = val[aKey]
				}
			}
			assessmentValue := &diseases.AssessmentValue{AssessmentId: assessmentId, Operator: operator, Value: value}

			_, err := datastore.Put(c, newAssessmentValueKey, assessmentValue)
			if err != nil {
				c.Errorf("*** error saving a new AssessmentValue: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}
}

func GetPatientGroups(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){
		q := datastore.NewQuery("PatientGroup")
		var patientGroups []PatientGroup
		keys, err := q.GetAll(c, &patientGroups)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for idx, key := range keys {
			id := strconv.FormatInt(key.IntID(), 10)
			patientGroups[idx].Id= id
		}
		gorca.WriteJSON(c, w, r, patientGroups)
	}else{
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}
}
