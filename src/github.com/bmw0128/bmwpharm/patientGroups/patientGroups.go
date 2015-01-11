package patientGroups

import (
	"appengine"
	"appengine/datastore"
	"appengine/user"
	"net/http"
	//"encoding/json"
	"strconv"
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	"github.com/bmw0128/bmwpharm/clients"
	//"github.com/bmw0128/bmwpharm/diseases"
)

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
	NYHAClass int //1, 2,3 or 4
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
	//m.HandleFunc("/new", CreateDisease).Methods("POST")
	//m.HandleFunc("/edit", EditDisease).Methods("POST")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
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
