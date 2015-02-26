package assessments

import (
	"appengine"
	"appengine/datastore"
	"appengine/user"
	"net/http"
	"encoding/json"
	"strconv"
	"sort"
	"strings"
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

	m.HandleFunc("/", GetAssessments).Methods("GET")

	m.HandleFunc("/{id}/", GetAssessmentById).Methods("GET")
	m.HandleFunc("/{id}/", DeleteAssessment).Methods("DELETE")
	m.HandleFunc("/new", CreateAssessment).Methods("POST")
	m.HandleFunc("/edit", EditAssessment).Methods("POST")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

type Assessment struct {
	Id string `json:"id"`
	Name string `json:"assessmentName"`
	AliasNames []string `json:"aliasNames"`
}

type ByName []Assessment
func (a ByName) Len() int           { return len(a) }
func (a ByName) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByName) Less(i, j int) bool { return strings.ToLower(a[i].Name) < strings.ToLower(a[j].Name) }

func EditAssessment(w http.ResponseWriter, r *http.Request){

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

		var theAssessment Assessment
		//d := new(Drug)
		dec := json.NewDecoder(r.Body)
		dec.Decode(&theAssessment)

		//stringId := vars["id"]
		stringId := theAssessment.Id;
		//c.Infof("*** stringId: %v", stringId)
		//c.Infof("**** theDrug: %v", theDrug);

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "Assessment", "", entity_id_int, nil)

		_, err := datastore.Put(c, key, &theAssessment)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func GetAssessmentById(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "Assessment", "", entity_id_int, nil)

		q := datastore.NewQuery("Assessment").Filter("__key__ =", key)
		t := q.Run(c)
		var result Assessment

		for {
			//key, err := t.Next(&result)
			_, err := t.Next(&result)
			if err == datastore.Done {
				result.Id= stringId
				//c.Infof("*** found disease: %v ", result)
				//c.Infof("*** found disease name: %v ", result.Name)
				gorca.WriteJSON(c, w, r, result)
				break // No further entities match the query.
			}
			if err != nil {
				c.Errorf("Fetching next Assessment: %v", err)
				break
			}
		}
	}
}

func CreateAssessment(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {

		defer r.Body.Close()
		var assessment Assessment
		dec := json.NewDecoder(r.Body)
		dec.Decode(&assessment)

		//c.Infof("*** assessment: %v", assessment)

		_, err := datastore.Put(c, datastore.NewIncompleteKey(c, "Assessment", nil), &assessment)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	}

}

func GetAssessments(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){
		q := datastore.NewQuery("Assessment")
		var assessments []Assessment
		keys, err := q.GetAll(c, &assessments)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for idx, key := range keys {
			id := strconv.FormatInt(key.IntID(), 10)
			assessments[idx].Id= id
		}
		sort.Sort(ByName(assessments))
		gorca.WriteJSON(c, w, r, assessments)
	}else{
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}
}

func DeleteAssessment(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		assessmentKey := datastore.NewKey(c, "Assessment", "", entity_id_int, nil)

		err := datastore.RunInTransaction(c, func(c appengine.Context) error {

				//delete the Assessment
				err := datastore.Delete(c, assessmentKey)
				if err != nil{
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return err
				}
				return err
			}, nil)
		if err != nil {
			c.Errorf("Transaction failed  in DeleteAssessment: %v", err)
			http.Error(w, "Internal Server Error", 500)
			return
		}

	}
}
