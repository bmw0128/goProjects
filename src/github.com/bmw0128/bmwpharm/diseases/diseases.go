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

	// Add the handler for GET /.
	//m.HandleFunc("/", Load).Methods("GET")
	//m.HandleFunc("/{key}/", GetDisease).Methods("GET")
	//m.HandleFunc("/", GetDiseases2).Methods("GET")

	m.HandleFunc("/", GetDiseases).Methods("GET")
	m.HandleFunc("/{id}/", GetDiseaseById).Methods("GET")
	m.HandleFunc("/new", CreateDisease).Methods("POST")
	m.HandleFunc("/edit", EditDisease).Methods("POST")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

type Disease struct {
	Id string `json:"id"`
	Name string `json:"diseaseName"`
	AliasNames []string `json:"aliasNames"`
	AssessmentValues []AssessmentValue `json:"assessmentValues"`
}

type DiseaseTemp struct {
	Id string `json:"id"`
	Name string `json:"diseaseName"`
	AliasNames []string `json:"aliasNames"`
	AssessmentValues []map[string]string `json:"assessments"`
}

type AssessmentValue struct {
	Id string `json:"id"`
	AssessmentId string `json:"assessmentId"`
	Operator string `json:"operator"`
	Value string `json:"value"`
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

		//stringId := vars["id"]
		stringId := theDisease.Id;
		//c.Infof("*** stringId: %v", stringId)
		//c.Infof("**** theDrug: %v", theDrug);

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "Disease", "", entity_id_int, nil)

		_, err := datastore.Put(c, key, &theDisease)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
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
					c.Errorf("error fetching AssessmentValue: %v", error)
					break
				}

				for i, _ := range assessmentValues {
					assessmentValueKey := assessmentValuesKeys[i]
					id := strconv.FormatInt(assessmentValueKey.IntID(), 10)
					assessmentValues[i].Id= id
				}

				//c.Infof("*** assessmentValues %v", assessmentValues)
				result.AssessmentValues= assessmentValues

				gorca.WriteJSON(c, w, r, result)
				break // No further entities match the query.
			}
			if err != nil {
				c.Errorf("error fetching next Disease: %v", err)
				break
			}
		}
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

	if(clients.ClientIsAdmin(loggedInClient)){
		q := datastore.NewQuery("Disease")
		var diseases []Disease
		keys, err := q.GetAll(c, &diseases)
		if err != nil {
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



// error response contains everything we need to use http.Error
/*
type handlerError struct {
	Error   error
	Message string
	Code    int
}
*/
//end from docs.go

// GetDisease fetches the disease
/*
func GetDisease(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)

	//Get the Key.
	vars := mux.Vars(r)
	key := vars["key"]
	c.Infof("*** key: " + key)
}
*/

func Load(w http.ResponseWriter, r *http.Request){

	//log.Println("**** a ");
	/*
	aDisease := Disease{
		Name:     "Essential Hypertension",
		Stage1HTN: m["1Tx"]:m["Primary"]:"hydrochlorothiazide : 12.5 to 50 mg orally once daily",
	}

	key := datastore.NewIncompleteKey(c, "disease", nil)
	_, err := datastore.Put(c, key, &aDisease)

	//key, err := datastore.Put(c, datastore.NewIncompleteKey(c, "disease", nil), &aDisease)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	*/

}
