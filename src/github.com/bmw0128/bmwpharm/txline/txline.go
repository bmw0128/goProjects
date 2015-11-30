package txline

import (
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	"net/http"
	"github.com/bmw0128/bmwpharm/clients"
	"appengine/user"
	"appengine"
	"io/ioutil"
	//"encoding/json"
)

func MakeMuxer(prefix string) http.Handler {

	var m *mux.Router

	// Pass through the prefix if we have one.
	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	m.HandleFunc("/patientGroupingCombo/{pgcId}/", NewTxLine).Methods("POST")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

type TxLine struct{
	Id string `json:"id"`
	Number string `json:"number"`
	Name string `json:"name"`
	Information string `json:"information"`
	PrimaryGroupA []string `json:"primaryGroupA"`
	PrimaryGroupB []string `json:"primaryGroupB"`
	PrimaryGroupC []string `json:"primaryGroupC"`
	SecondaryGroupA []string `json:"secondaryGroupA"`
	SecondaryGroupB []string `json:"secondaryGroupB"`
	SecondaryGroupC []string `json:"secondaryGroupC"`
	TertiaryGroupA []string `json:"tertiaryGroupA"`
	TertiaryGroupB []string `json:"tertiaryGroupB"`
	TertiaryGroupC []string `json:"tertiaryGroupC"`
}

func NewTxLine(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusForbidden)
	}else {

		/*testing */
		bytes, _ := ioutil.ReadAll(r.Body)
		c.Infof("*** New TxLine bytes: " + string(bytes));
		//end testing

		//Get the Key.
		//vars := mux.Vars(r)
		//pgcId := vars["pgcId"]
		//c.Infof("*** txline, pgcId: %s", pgcId)

		/*
		var txLine TxLine
		defer r.Body.Close()
		dec := json.NewDecoder(r.Body)
		dec.Decode(&txLine)
		*/

	}
}


