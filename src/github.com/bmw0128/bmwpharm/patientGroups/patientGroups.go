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
/*
type PatientGroup struct {
	Id string `json:"id"`
	Name string
	HasDiseases []string //holds disease Ids as strings
	//these are diseases that have no bearing, the patient may or may not have these diseases for this group
	NeutralDiseases []string //holds disease Ids as strings
	HasNotDiseases []string //holds disease Ids as strings

	Pregnant bool
	Systolic int
	Diastolic int
	EjectionFractionPercentage int
	NYHAClass int //1, 2, 3 or 4
}
*/
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

	// Add the handler for GET /.
	//m.HandleFunc("/", Load).Methods("GET")
	//m.HandleFunc("/{key}/", GetDisease).Methods("GET")
	//m.HandleFunc("/", GetDiseases2).Methods("GET")

	m.HandleFunc("/", GetPatientGroups).Methods("GET")
	//m.HandleFunc("/{id}/", GetDiseaseById).Methods("GET")
	m.HandleFunc("/new", CreatePatientGroup).Methods("POST")
	//m.HandleFunc("/edit", EditDisease).Methods("POST")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
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

		c.Infof("*** PatientGroupTemp: %v", patientGroupTemp)

		/*
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
		*/

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
