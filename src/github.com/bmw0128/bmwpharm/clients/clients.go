package clients

import(
	"net/http"
	"appengine"
	"appengine/user"
	"appengine/datastore"
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	"encoding/json"
	"strings"
	"strconv"
	//"log"

)

func MakeMuxer(prefix string) http.Handler {

	//log.Println("**** clients.MakeMuxer(): " + prefix);

	var m *mux.Router

	// Pass through the prefix if we have one.
	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	m.HandleFunc("/new", CreateClient).Methods("POST")
	m.HandleFunc("/", GetClients).Methods("GET")
	m.HandleFunc("/{clientEmail}/", GetClient).Methods("GET")
	m.HandleFunc("/role", GetClientRole).Methods("GET")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

func GetClient(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	//Get the Key.
	vars := mux.Vars(r)
	clientEmail := vars["clientEmail"]

	theClient := GetClientByEmail(c, clientEmail)

	gorca.WriteJSON(c, w, r, theClient)

}

//GetClients just gets all clients from the DB
func GetClients(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	client := GetClientByEmail(c, u.Email)

	if(ClientIsAdmin(client)){

		q := datastore.NewQuery("Client")
		var clients []Client
		_, err := q.GetAll(c, &clients)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		gorca.WriteJSON(c, w, r, clients)
	}else{
		gorca.WriteJSON(c, w, r, http.StatusNotFound)

	}
}

//GetClientAuth returns the user's email if they have an account in bmwpharm
func GetClientRole(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	//c.Infof("*** GetClientRole, u: " + u.Email)
	//c.Infof(user.IsAdmin(c))

	client := GetClientByEmail(c, u.Email)
	//c.Infof("*** received client from db, in GetClientRole: " + client.Email + " - " + client.Role)

	gorca.WriteJSON(c, w, r, client.Role)
}

func CreateClient(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	loggedInUser := user.Current(c)
	loggedInClient := GetClientByEmail(c, loggedInUser.Email)

	if(!ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else{

		defer r.Body.Close()
		var aClient Client
		dec := json.NewDecoder(r.Body)
		dec.Decode(&aClient)

		//see if client exists already
		existingClient := GetClientByEmail(c, aClient.Email)
		if(existingClient.Email == ""){
			_, err := datastore.Put(c, datastore.NewIncompleteKey(c, "Client", nil), &aClient)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}else{
			gorca.WriteJSON(c, w, r, existingClient)
		}
	}


	/*
	var client2 Client
	if err = datastore.Get(c, key, &client2); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "Stored and retrieved the Client email %q", client2.Email)
	*/
}

func GetClientByEmail(c appengine.Context, email string) Client{

	q := datastore.NewQuery("Client").Filter("Email =", strings.ToLower(email))
	t := q.Run(c)
	var theClient Client

	for {
		key, err := t.Next(&theClient)
		if err == datastore.Done {
			break // No further entities match the query.
		}
		if err != nil {
			c.Errorf("fetching next Client: %v", err)
			break
		}
		//c.Infof("*** GetClientByEmail client key: %v:", key)
		//c.Infof("*** A GetClientByEmail client only: %v:", theClient)
		theClient.Id= strconv.FormatInt(key.IntID(), 10)
		//c.Infof("*** B GetClientByEmail client only: %v:", theClient)
		// Do something with Person p and Key k
		//c.Infof("*** client role: " + client.Role)
	}
	return theClient
}

func ClientIsAdmin(client Client) bool{

	if(client.Role == "admin"){
		return true
	}
	return false
}

func ClientIsClient(client Client) bool{

	if(client.Role == "client"){
		return true
	}
	return false
}

type Client struct {
	Id string `json:"id"`
	Email string `json:"email"`
	Role string `json:"role"`
}

