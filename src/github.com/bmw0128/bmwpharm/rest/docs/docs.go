package docs

import (
	"appengine"
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	"net/http"
	"log"

)

// MakeMuxer creates a http.Handler to manage all user operations. If
// a prefix is given, that prefix will be the first part of the
// url. This muxer will provide the following handlers and return a
// RESTful 404 on all others.
//
//  GET     prefix + /      Get the currently logged in user.
func MakeMuxer(prefix string) http.Handler {

	var m *mux.Router

	// Pass through the prefix if we got one.
	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	// Add the handler for GET /.
	//m.HandleFunc("/", GetDiseases).Methods("GET")
	//m.HandleFunc("/", GetFoo).Methods("GET")

	//m.HandleFunc("/{key}/", GetDisease).Methods("GET")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

//href="#/recipes/view/{{recipe.Key}}">{{recipe.Name}}


// GetDisease fetches the disease
func GetDisease(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)

	 //Get the Key.
	vars := mux.Vars(r)
	key := vars["key"]
	c.Infof("*** key: " + key)
	/*
	recipe, ok := GetDiseaseHelper(c, w, r, key)
	if !ok {
		return
	}

	// Write the recipes as JSON.
	gorca.WriteJSON(c, w, r, recipe)
	*/
}

// GetDiseaseHelper is a helper function that retrieves a recipe and it's
// items from the datastore. If a failure occured, false is returned
// and a response was returned to the request. This case should be
// terminal.
/*
func GetDiseaseHelper(c appengine.Context, w http.ResponseWriter,
	r *http.Request, key string) (*Recipe, bool) {

	// Decode the string version of the key.

	k, err := datastore.DecodeKey(key)
	if err != nil {
		gorca.LogAndUnexpected(c, w, r, err)
		return nil, false
	}

	// Get the recipe by key.
	var recipe Recipe
	if err := datastore.Get(c, k, &recipe); err != nil {
		gorca.LogAndNotFound(c, w, r, err)
		return nil, false
	}

	return &recipe, true
}
*/

func GetDiseases(w http.ResponseWriter, r *http.Request) {

	log.Println("*** GetDiseases");
	c := appengine.NewContext(r)
	c.Infof("*** GetDiseases: ")

	// list of all of the diseases
	var diseases = make([]Disease, 0)
	// bootstrap some data
	diseases = append(diseases, Disease{"Hypertensionn", "Blue"})
	diseases = append(diseases, Disease{"COPDD", "Red"})
	diseases = append(diseases, Disease{"Diabetess", "Yellow"})
	diseases = append(diseases, Disease{"CHFF", "Green"})

	/*
	gorca.WriteJSON(c, w, r, Disease{
		Name: "hypertension",
		Color: "blue",
	})
	*/
	gorca.WriteJSON(c, w, r, diseases)
}

//Disease model
type Disease struct {
	Name string `json:"name"`
	Color string `json:"color"`
}


// error response contains everything we need to use http.Error
type handlerError struct {
	Error   error
	Message string
	Code    int
}
