package patients

import(
	"appengine"
	"appengine/user"
	//"appengine/datastore"
	"net/http"
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	//"strings"
	"encoding/json"
	"github.com/bmw0128/bmwpharm/clients"
	//"strconv"
	//"log"
	//"io/ioutil"
	//"net/http/httputil"
	//"encoding/base64"
	//"fmt"
)

type Patient struct {
	Id string `json:"id"`
	ClientId string `json:"clientId"` //client has patients
	Diseases []int `json:"diseases"`
	Age int `json:"age"`
	Gender string `json:"gender"`
	Pregnant bool `json:"pregnant"`
	Race string `json:"race"`
	//Systolic int `json:"systolic"`
	//Diastolic int `json:"diastolic"`

	//CHF, Chronic/Congestive Heart Failure related
	//EjectionFraction int `json:"ejectionFraction"` //ejectionFraction will be a percentage
	//NYHAClass int `json:"nyhaClass"` //I, II, III, IV, but we'll use 1, 2, 3, and 4

	//Osteoporosis related
	//BMD float32 `json:"bmd"`

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

	m.HandleFunc("/new", CreatePatient).Methods("POST")

	return m

}

func CreatePatient(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	loggedInUser := user.Current(c)
	//c.Infof("*** loggedInUser: %v: ", loggedInUser)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)
	//c.Infof("*** loggedInClient: %v: ", loggedInClient)

	//bytes, _ := ioutil.ReadAll(r.Body)
	//c.Infof("*** bytes: " + string(bytes));

	//make sure we have a logged in user
	if(loggedInUser.Email != ""){

		var aPatient Patient
		defer r.Body.Close()
		dec := json.NewDecoder(r.Body)
		dec.Decode(&aPatient)

		aPatient.ClientId= loggedInClient.Id

		c.Infof("*** aPatient: %v", aPatient)

	}else{
		gorca.WriteJSON(c, w, r, http.StatusUnauthorized)
	}
}

func GetPatients(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	//loggedInUser := user.Current(c)
	//loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	//if (!clients.ClientIsAdmin(loggedInClient)) {
	if (false) {
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {
		var patients = make([]Patient, 0)

		var p Patient
		p = Patient{Id: "1", ClientId: "1", Age: 32, Pregnant: true}
		patients= append(patients, p)

		p= Patient{Id: "2", ClientId: "1", Age: 67, Pregnant: false}
		patients= append(patients, p)

		gorca.WriteJSON(c, w, r, patients)
	}
}
