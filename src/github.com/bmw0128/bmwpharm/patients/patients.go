package patients

import(
	"appengine"
	"appengine/user"
	"appengine/datastore"
	"net/http"
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	//"strings"
	"encoding/json"
	"github.com/bmw0128/bmwpharm/clients"
	"strconv"
	//"log"
	//"io/ioutil"
	//"net/http/httputil"
	//"encoding/base64"
	//"fmt"
)

type Patient struct {
	Id string `json:"id"`
	ClientId string `json:"clientId"` //client has patients
	FirstName string `json:"firstName"`
	LastName string `json:"lastName"`
	Age int `json:"age"`
	Gender string `json:"gender"`
	Pregnant bool `json:"pregnant"`
	Race string `json:"race"`
	BP string `json:"bp"`
	HeartRate int `json:"heartRate"`

	Diseases []string `json:"diseases"`

}

func MakeMuxer(prefix string) http.Handler {

	var m *mux.Router

	// Pass through the prefix if we have one.
	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	m.HandleFunc("/", GetPatients).Methods("GET")
	m.HandleFunc("/{id}/", GetPatientById).Methods("GET")
	m.HandleFunc("/{id}/", DeletePatient).Methods("DELETE")

	m.HandleFunc("/new", CreatePatient).Methods("POST")

	return m

}

func DeletePatient(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientHasARole(loggedInClient)){

		var isAdmin = clients.ClientIsAdmin(loggedInClient)
		var clientId= loggedInClient.Id

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "Patient", "", entity_id_int, nil)

		var thePatient Patient
		if err := datastore.Get(c, key, &thePatient); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if(isAdmin || (clientId == thePatient.ClientId)) {
			err := datastore.Delete(c, key)
			if err != nil{
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
		}else {
			gorca.WriteJSON(c, w, r, http.StatusUnauthorized)
		}
	}
}

func GetPatientById(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientHasARole(loggedInClient)){

		var isAdmin = clients.ClientIsAdmin(loggedInClient)
		var clientId= loggedInClient.Id

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "Patient", "", entity_id_int, nil)


		var thePatient Patient
		if err := datastore.Get(c, key, &thePatient); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		thePatient.Id= stringId

		if(isAdmin || (clientId == thePatient.ClientId)) {
			gorca.WriteJSON(c, w, r, thePatient)
		}else {
			gorca.WriteJSON(c, w, r, http.StatusUnauthorized)
		}
	}
}

func CreatePatient(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	//bytes, _ := ioutil.ReadAll(r.Body)
	//c.Infof("*** bytes: " + string(bytes));

	if(clients.ClientHasARole(loggedInClient)){

		var aPatient Patient
		defer r.Body.Close()
		dec := json.NewDecoder(r.Body)
		dec.Decode(&aPatient)

		aPatient.ClientId= loggedInClient.Id

		_, err := datastore.Put(c, datastore.NewIncompleteKey(c, "Patient", nil), &aPatient)
		if err != nil {
			c.Errorf("*** error saving Patient: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	}else{
		gorca.WriteJSON(c, w, r, http.StatusUnauthorized)
	}
}

func GetPatients(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientHasARole(loggedInClient)) {
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {

		var patients []Patient

		//stringId := vars["id"]
		var clientId= loggedInClient.Id

		//entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		//key := datastore.NewKey(c, "Patient", "", entity_id_int, nil)
		if(clients.ClientIsAdmin(loggedInClient)){
			q := datastore.NewQuery("Patient")
			keys, err := q.GetAll(c, &patients)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			for idx, key := range keys {
				id := strconv.FormatInt(key.IntID(), 10)
				patients[idx].Id= id
			}
		}else {
			q := datastore.NewQuery("Patient").Filter("ClientId =", clientId)
			keys, err := q.GetAll(c, &patients)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			for idx, key := range keys {
				id := strconv.FormatInt(key.IntID(), 10)
				patients[idx].Id= id
			}
		}
		//t := q.Run(c)
		//c.Infof("*** patients: %v", patients)

		gorca.WriteJSON(c, w, r, patients)
	}
}
