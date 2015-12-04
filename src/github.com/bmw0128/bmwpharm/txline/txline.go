package txline

import (
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	"net/http"
	"github.com/bmw0128/bmwpharm/clients"
	"appengine/user"
	"appengine"
	"appengine/datastore"
	//"io/ioutil"
	"encoding/json"
	"strconv"
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
	m.HandleFunc("/patientGroupingCombo/{pgcId}/", GetTxLine).Methods("GET")
	m.HandleFunc("/patientGroupingCombo/{pgcId}/all", GetAllTxLines).Methods("GET")
	m.HandleFunc("/edit/{id}/", EditTxLine).Methods("GET")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

type TxLine struct{
	PGCId string `json:"pgcId"`
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
	DosagePrimaryGroupA []DosageObj `json:"dosagePrimaryGroupA"`
	DosagePrimaryGroupB []DosageObj `json:"dosagePrimaryGroupB"`
	DosagePrimaryGroupC []DosageObj `json:"dosagePrimaryGroupC"`
	DosageSecondaryGroupA []DosageObj `json:"dosageSecondaryGroupA"`
	DosageSecondaryGroupB []DosageObj `json:"dosageSecondaryGroupB"`
	DosageSecondaryGroupC []DosageObj `json:"dosageSecondaryGroupC"`
	DosageTertiaryGroupA []DosageObj `json:"dosageTertiaryGroupA"`
	DosageTertiaryGroupB []DosageObj `json:"dosageTertiaryGroupB"`
	DosageTertiaryGroupC []DosageObj `json:"dosageTertiaryGroupC"`
}

type DosageObj struct {
	DrugName string `json:"drugName"`
	Dosage string `json:"dosage"`
}

func GetAllTxLines(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusForbidden)
	}else {

		vars := mux.Vars(r)
		pgcId := vars["pgcId"]

		txLines := GetAllTxLinesByPGCId(c, pgcId)
		//c.Infof("*** found these txLines: %v", txLines)

		gorca.WriteJSON(c, w, r, txLines)
	}
}

func GetTxLine(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusForbidden)
	}else {

		vars := mux.Vars(r)
		pgcId := vars["pgcId"]

		txLine := GetTxLineByPGCId(c, pgcId)
		c.Infof("*** found this txLine: %s", txLine)

		stringId := txLine.Id;
		c.Infof("*** txLine stringId: %v", stringId)

		gorca.WriteJSON(c, w, r, txLine)
	}
}

func NewTxLine(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusForbidden)
	}else {

		/*testing */
		//bytes, _ := ioutil.ReadAll(r.Body)
		//c.Infof("*** New TxLine bytes: " + string(bytes));
		//end testing

		vars := mux.Vars(r)
		pgcId := vars["pgcId"]

		var txLine TxLine
		defer r.Body.Close()
		dec := json.NewDecoder(r.Body)
		dec.Decode(&txLine)

		txLine.PGCId= pgcId

		if(txLine.Id != ""){
			c.Infof("*** editing a TxLine")
			entity_id_int, _ := strconv.ParseInt(txLine.Id, 10, 64)
			txLineKey := datastore.NewKey(c, "TxLine", "", entity_id_int, nil)

			_, err := datastore.Put(c, txLineKey, &txLine)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}else{
			c.Infof("*** making a new TxLine")
			_, err := datastore.Put(c, datastore.NewIncompleteKey(c, "TxLine", nil), &txLine)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			/*
			existingTxLine := GetTxLineByPGCId(c, pgcId)
			//check if this TxLine exists
			if(existingTxLine.PGCId == "") {
				_, err := datastore.Put(c, datastore.NewIncompleteKey(c, "TxLine", nil), &txLine)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}else {
				gorca.WriteJSON(c, w, r, txLine)
			}
			*/
		}

	}
}

func GetTxLineByPGCId(c appengine.Context, pgcId string) TxLine{

	q := datastore.NewQuery("TxLine").Filter("PGCId=", pgcId)
	t := q.Run(c)
	var result TxLine

	for {
		key, err := t.Next(&result)
		if(key != nil){
			id := strconv.FormatInt(key.IntID(), 10)
			result.Id= id
		}
		if err == datastore.Done {
			break // No further entities match the query.
		}
		if err != nil {
			c.Errorf("error fetching next TxLine: %v", err)
			break
		}
	}
	return result
}

func GetAllTxLinesByPGCId(c appengine.Context, pgcId string) []TxLine{

	q := datastore.NewQuery("TxLine").Filter("PGCId=", pgcId)
	var txLines []TxLine

	c.Infof("*** in GetAllTxLinesByPGCId for pgcId: %v", pgcId)

	keys, err := q.GetAll(c, &txLines)
	if err != nil {
		c.Errorf("error fetching TxLines for pgcId: %v, the error is: %v", pgcId, err)
	}
	for idx, key := range keys {
		id := strconv.FormatInt(key.IntID(), 10)
		txLines[idx].Id= id
	}
	return txLines
}

func EditTxLine(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	c.Infof("*** in EditTxLine")

	if(clients.ClientIsAdmin(loggedInClient)){

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]
		c.Infof("*** stringId  in EditTxLine: %v", stringId)

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "TxLine", "", entity_id_int, nil)

		q := datastore.NewQuery("TxLine").Filter("__key__ =", key)
		t := q.Run(c)
		var result TxLine

		for {
			//key, err := t.Next(&result)
			_, err := t.Next(&result)
			if err == datastore.Done {
				result.Id= stringId
				c.Infof("*** EditTxLine got txLine: %v: ", result)
				gorca.WriteJSON(c, w, r, result)
				break // No further entities match the query.
			}
			if err != nil {
				c.Errorf("Fetching next TxLine: %v", err)
				break
			}
		}

	}

}

