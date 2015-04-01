package diseases

import (
	//"fmt"
	"appengine"
	"appengine/datastore"
	"appengine/user"
	"net/http"
	"encoding/json"
	//"io/ioutil"
	"strconv"
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	"github.com/bmw0128/bmwpharm/clients"
)

func MakeMuxer(prefix string) http.Handler {

	var m *mux.Router

	// Pass through the prefix if we have one.
	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	m.HandleFunc("/", GetDiseases).Methods("GET")
	m.HandleFunc("/{id}/", GetDiseaseById).Methods("GET")
	m.HandleFunc("/{id}/patientGroupings", GetPatientGroupings).Methods("GET")
	m.HandleFunc("/{id}/", DeleteDisease).Methods("DELETE")
	m.HandleFunc("/new", CreateDisease).Methods("POST")
	m.HandleFunc("/edit", EditDisease).Methods("POST")
	//m.HandleFunc("/newPatientGroupingCombo", NewPatientGroupingCombo).Methods("POST")

	m.HandleFunc("/{diseaseId}/newPatientGroupingCombo", NewPatientGroupingCombo).Methods("POST")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

type Disease struct {
	Id string `json:"id"`
	Name string `json:"diseaseName"`
	AliasNames []string `json:"aliasNames"`
	AssessmentValues []AssessmentValue `json:"assessmentValues"`
	//PatientGroupings []map[string][]PatientGroup `json:"patientGroupings"`
	//PatientGroupings []PatientGrouping `json:"patientGroupings"`
}

type DiseaseTemp struct {
	Id string `json:"id"`
	Name string `json:"diseaseName"`
	AliasNames []string `json:"aliasNames"`
	AssessmentValues []map[string]string `json:"assessments"`
}

type DiseaseTx struct{
	Id string `json:"id"`
	Name string `json:"diseaseName"`
	PatientGroupingsTx []PatientGroupingTx `json:"patientGroupingsTx"`
}

type AssessmentValue struct {
	Id string `json:"id"`
	AssessmentId string `json:"assessmentId"`
	Operator string `json:"operator"`
	Value string `json:"value"`
}

type PatientGroupingTx struct {
	Id string `json:"id"`
	Disease Disease `json:disease"`
	Name string `json:"patientGroupingName"`
	PatientGroups []PatientGroup `json:"patientGroups"`
}

type PatientGrouping struct {
	Id string `json:"id"`
	//Disease string `json:disease"`
	Name string `json:"patientGroupingName"`
	PatientGroupingIds []string `json:"patientGroupingIds"`
	//PatientGroups []PatientGroup `json:"patientGroups"`
}

type PatientGroup struct{
	Id string `json:"id"`
	Name string `json:"patientGroupName"`
	AssessmentValues []AssessmentValue `json:"assessmentValues"`
}

func GetPatientGroupings(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){

		//Get the Key.
		vars := mux.Vars(r)
		diseaseStringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(diseaseStringId, 10, 64)
		key := datastore.NewKey(c, "Disease", "", entity_id_int, nil)

		q := datastore.NewQuery("Disease").Filter("__key__ =", key)
		t := q.Run(c)
		var theDisease Disease

		for {
			_, err := t.Next(&theDisease)
			theDisease.Id= diseaseStringId
			if err == datastore.Done {

				//get PatientGroupings
				q = datastore.NewQuery("PatientGrouping").Ancestor(key)
				var patientGroupings []PatientGrouping
				//patientGroupingsKeys, error := q.GetAll(c, &patientGroupings)
				pgKeys, error := q.GetAll(c, &patientGroupings)
				//set Ids
				for i, _ := range patientGroupings {
					pgKey := pgKeys[i]
					pgId := strconv.FormatInt(pgKey.IntID(), 10)
					c.Infof("*** pgId: %s", pgId)
					patientGroupings[i].Id= pgId
				}

				if error != nil {
					c.Errorf("error fetching PatientGroupings in GetDiseaseTx: %v", error)
					break
				}
				var patientGroupingsTx []PatientGroupingTx

				var patientGroups []PatientGroup
				for i, _ := range patientGroupings{
					patientGroupingName := patientGroupings[i].Name
					patientGroupingId := patientGroupings[i].Id
					for j, _ := range patientGroupings[i].PatientGroupingIds{
						patientGroupStringId := patientGroupings[i].PatientGroupingIds[j]
						pg_entity_id_int, _ := strconv.ParseInt(patientGroupStringId, 10, 64)
						patientGroupKey := datastore.NewKey(c, "PatientGroup", "", pg_entity_id_int, nil)

						q = datastore.NewQuery("PatientGroup").Filter("__key__ =", patientGroupKey)
						t = q.Run(c)
						var aPatientGroup PatientGroup
						_, error = t.Next(&aPatientGroup)
						patientGroups= append(patientGroups, aPatientGroup)
						if error != nil {
							c.Errorf("error fetching a PatientGroup in GetDiseaseTx: %v", error)
							break
						}

					}
					pgTx := PatientGroupingTx{patientGroupingId, theDisease, patientGroupingName, patientGroups}
					patientGroupingsTx = append(patientGroupingsTx, pgTx)

				}
				c.Infof("*** final PGs: %s", patientGroupingsTx)

				gorca.WriteJSON(c, w, r, patientGroupingsTx)
				break // No further entities match the query.
			}
			if err != nil {
				c.Errorf("error fetching next Disease in GetPatientGroupings: %v", err)
				break
			}
		}
	}
}

func NewPatientGroupingCombo(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {

		//Get the Key.
		vars := mux.Vars(r)
		diseaseId := vars["diseaseId"]

		entity_id_int, _ := strconv.ParseInt(diseaseId, 10, 64)
		diseaseKey := datastore.NewKey(c, "Disease", "", entity_id_int, nil)
		//c.Infof("*** diseaseKey: %s", diseaseKey)

		var patientGrouping PatientGrouping
		defer r.Body.Close()
		dec := json.NewDecoder(r.Body)
		dec.Decode(&patientGrouping)

		aPatientGroupingKey := datastore.NewIncompleteKey(c, "PatientGrouping", diseaseKey)
		_, err := datastore.Put(c, aPatientGroupingKey, &patientGrouping)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		/*testing
		bytes, _ := ioutil.ReadAll(r.Body)
		c.Infof("*** NewPatientGroupingCombo bytes: " + string(bytes));
		//end testing
		*/

	}
}

func EditDisease(w http.ResponseWriter, r *http.Request){

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

		var theDisease Disease
		//d := new(Drug)
		dec := json.NewDecoder(r.Body)
		dec.Decode(&theDisease)

		stringId := theDisease.Id

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "Disease", "", entity_id_int, nil)
		//put in a transaction since may be updating disease name and assessment values
		err := datastore.RunInTransaction(c, func(c appengine.Context) error {

				_, err := datastore.Put(c, key, &theDisease)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return err
				}

				q := datastore.NewQuery("AssessmentValue").Ancestor(key)
				var assessmentValues []AssessmentValue
				assessmentValuesKeys, error := q.GetAll(c, &assessmentValues)
				if error != nil {
					c.Errorf("error fetching AssessmentValue in EditDisease: %v", error)
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
				newAssessmentValueKey := datastore.NewIncompleteKey(c, "AssessmentValue", key)

				for _, av := range theDisease.AssessmentValues {

					assessmentValue := &AssessmentValue{AssessmentId: av.AssessmentId, Operator: av.Operator, Value: av.Value}
					_, err := datastore.Put(c, newAssessmentValueKey, assessmentValue)
					if err != nil {
						c.Errorf("*** error saving a new AssessmentValue in EditDisease: %v", err)
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return err
					}
				}

			return err
			}, nil)
		if err != nil {
			c.Errorf("Transaction failed in EditDisease: %v", err)
			http.Error(w, "Internal Server Error", 500)
			return
		}

	}
}

func DeleteDisease(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		diseaseKey := datastore.NewKey(c, "Disease", "", entity_id_int, nil)

		err := datastore.RunInTransaction(c, func(c appengine.Context) error {

				q := datastore.NewQuery("AssessmentValue").Ancestor(diseaseKey)
				var assessmentValues []AssessmentValue
				assessmentValuesKeys, error := q.GetAll(c, &assessmentValues)
				if error != nil {
					c.Errorf("error fetching AssessmentValue in DeleteDisease: %v", error)
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
				//delete the disease
				err := datastore.Delete(c, diseaseKey)
				if err != nil{
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return err
				}

				return err
			}, nil)
		if err != nil {
			c.Errorf("Transaction failed  in DeleteDisease: %v", err)
			http.Error(w, "Internal Server Error", 500)
			return
		}

	}
}

func GetDiseaseById(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "Disease", "", entity_id_int, nil)

		q := datastore.NewQuery("Disease").Filter("__key__ =", key)
		t := q.Run(c)
		var result Disease

		for {
			_, err := t.Next(&result)
			result.Id= stringId
			if err == datastore.Done {

				q := datastore.NewQuery("AssessmentValue").Ancestor(key)
				var assessmentValues []AssessmentValue
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
				c.Errorf("error fetching next Disease in GetDiseaseById: %v", err)
				break
			}
		}
	}
}

func CreateDisease(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {

		defer r.Body.Close()
		var diseaseTemp DiseaseTemp
		dec := json.NewDecoder(r.Body)
		dec.Decode(&diseaseTemp)


		disease := &Disease{Name: diseaseTemp.Name, AliasNames: diseaseTemp.AliasNames}

		newDiseaseKey, err := datastore.Put(c, datastore.NewIncompleteKey(c, "Disease", nil), disease)
		if err != nil {
			c.Errorf("*** error saving Disease: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		newAssessmentValueKey := datastore.NewIncompleteKey(c, "AssessmentValue", newDiseaseKey)

		//'val' is a map
		for _, val := range diseaseTemp.AssessmentValues {
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
			assessmentValue := &AssessmentValue{AssessmentId: assessmentId, Operator: operator, Value: value}

			_, err := datastore.Put(c, newAssessmentValueKey, assessmentValue)
			if err != nil {
				c.Errorf("*** error saving a new AssessmentValue: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

		}

		/*testing
		bytes, _ := ioutil.ReadAll(r.Body)
		c.Infof("*** disease bytes: " + string(bytes));
		//end testing
		*/

	}

}

func GetDiseases(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientHasARole(loggedInClient)){
		q := datastore.NewQuery("Disease")
		var diseases []Disease
		keys, err := q.GetAll(c, &diseases)
		if err != nil {
			c.Infof("*** GD: %s", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for idx, key := range keys {
			id := strconv.FormatInt(key.IntID(), 10)
			diseases[idx].Id= id
		}
		gorca.WriteJSON(c, w, r, diseases)
	}else{
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}
}

/*
func GetDrugByField(c appengine.Context, drugName string, nameProperty string) Drug{

	q := datastore.NewQuery("Drug").Filter(nameProperty + "=", strings.ToLower(drugName))
	t := q.Run(c)
	var result Drug

	for {
		key, err := t.Next(&result)
		if err == datastore.Done {
			break // No further entities match the query.
		}
		if err != nil {
			c.Errorf("Fetching next Drug: %v", err)
			break
		}
		q := datastore.NewQuery("Interaction").Ancestor(key)
		var interactions []Interaction
		_, error := q.GetAll(c, &interactions)
		if error != nil {
			c.Errorf("Fetching Drug: %v", error)
			break
		}
		//c.Infof("*** interactions %v", interactions)
		result.Interactions= interactions
		// Do something with Person p and Key k
		//c.Infof("*** client role: " + client.Role)
	}
	return result
}
*/
