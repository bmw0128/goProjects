package drugs

import (
	"appengine"
	"appengine/user"
	"appengine/datastore"
	"net/http"
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	"strings"
	"encoding/json"
	"github.com/bmw0128/bmwpharm/clients"
	"strconv"
	//"log"
	//"io/ioutil"
	//"net/http/httputil"
	//"encoding/base64"
	//"fmt"

)

type Interaction struct{
	Id string `json:"id"`
	DrugName string `json:"drugName"`
	SeverityLevel string `json:"severityLevel"`
	Summary string `json:"summary"`
}

type Drug struct {
	Id string `json:"id"`
	Name string `json:"drugName"`
	BrandNames []string `json:"brandNames"`
	ADRs []string `json:"adrs"`
	MonitoringParameters []string `json:"monitoringParameters"`
	Dosages []string `json:"dosages"`
	Interactions []Interaction `json:"interactions"`
}

type DrugTemp struct{
	Name string `json:"drugName"`
	BrandNames []string `json:"brandNames"`
	ADRs []string `json:"adrs"`
	MonitoringParameters []string `json:"monitoringParameters"`
	Dosages []string `json:"dosages"`
	Interactions [][]string `json:"interactions"`
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
	m.HandleFunc("/", GetDrugs).Methods("GET")
	m.HandleFunc("/byname/{drugName}/", GetDrugByName).Methods("GET")
	m.HandleFunc("/{id}/", GetDrugById).Methods("GET")
	m.HandleFunc("/{id}/", DeleteDrug).Methods("DELETE")
	m.HandleFunc("/withinteractions/{id}/", GetDrugWithInteractionsById).Methods("GET")
	m.HandleFunc("/new", CreateDrug).Methods("POST")
	m.HandleFunc("/edit", EditDrug).Methods("POST")
	m.HandleFunc("/{drugName}/createInteractions", CreateInteractions).Methods("POST")

	m.HandleFunc("/saveInteractions", SaveInteractions).Methods("POST")
	m.HandleFunc("/deleteInteractions", DeleteInteractions).Methods("POST")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

func DeleteDrug(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		drugKey := datastore.NewKey(c, "Drug", "", entity_id_int, nil)

		err := datastore.RunInTransaction(c, func(c appengine.Context) error {

				q := datastore.NewQuery("Interaction").Ancestor(drugKey)
				var interactions []Interaction
				interactionKeys, error := q.GetAll(c, &interactions)
				if error != nil {
					c.Errorf("error fetching Interaction in DeleteDrug: %v", error)
					return error
				}
				//delete all Interactions first
				for i, _ := range interactionKeys {

					interactionKey := interactionKeys[i]
					err := datastore.Delete(c, interactionKey)
					if err != nil{
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return err
					}
				}
				//delete the drug
				err := datastore.Delete(c, drugKey)
				if err != nil{
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return err
				}
				return err
			}, nil)
		if err != nil {
			c.Errorf("Transaction failed  in DeleteDrug: %v", err)
			http.Error(w, "Internal Server Error", 500)
			return
		}

	}
}

func DeleteInteractions(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if (!clients.ClientIsAdmin(loggedInClient)) {
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {

		var drug Drug
		defer r.Body.Close()
		dec := json.NewDecoder(r.Body)
		dec.Decode(&drug)

		//c.Infof("*** DeleteInteraction drug: %v: ", drug)

		drug_entity_id_int, _:= strconv.ParseInt(drug.Id, 10, 64)
		theDrugKey := datastore.NewKey(c, "Drug", "", drug_entity_id_int, nil)

		for _, anInteraction := range drug.Interactions {

			if(anInteraction.Id != ""){

				interaction_entity_id_int, e := strconv.ParseInt(anInteraction.Id, 10, 64)
				if(e != nil){
					c.Infof("*** DeleteInteractions error ParseInt: %v, error: %v", anInteraction, e)
					http.Error(w, e.Error(), http.StatusInternalServerError)
					return
				}

				existingInterationKey := datastore.NewKey(c, "Interaction", "", interaction_entity_id_int, theDrugKey)
				err := datastore.Delete(c, existingInterationKey)
				if(err != nil){
					c.Infof("*** DeleteInteractions error Deleting interaction: %v, error: %v", anInteraction, err)
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}
		}

	}
}

func SaveInteractions(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {

		var drug Drug
		defer r.Body.Close()
		dec := json.NewDecoder(r.Body)
		dec.Decode(&drug)

		//c.Infof("*** Drug: %v: ", drug)

		for _, anInteraction := range drug.Interactions {

			//c.Infof("*** SaveInteraction: %v", anInteraction)

			drug_entity_id_int, _:= strconv.ParseInt(drug.Id, 10, 64)
			theDrugKey := datastore.NewKey(c, "Drug", "", drug_entity_id_int, nil)


			//the interaction exists
			if(anInteraction.Id != ""){

				interaction_entity_id_int, e := strconv.ParseInt(anInteraction.Id, 10, 64)
				if(e != nil){
					c.Infof("*** error ParseInt: %v", e)
				}

				existingInterationKey := datastore.NewKey(c, "Interaction", "", interaction_entity_id_int, theDrugKey)

				_, err := datastore.Put(c, existingInterationKey, &anInteraction)
				if err != nil {
					c.Infof("*** error Editing interaction: %v", err)
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

			}else{

				anInteractionKey := datastore.NewIncompleteKey(c, "Interaction", theDrugKey)
				_, err := datastore.Put(c, anInteractionKey, &anInteraction)
				if err != nil {
					c.Infof("*** error saving New interaction: %v", err)
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}

		}
	}

}

func GetDrugWithInteractionsById(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)) {

		vars := mux.Vars(r)
		stringId := vars["id"]

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		drugKey := datastore.NewKey(c, "Drug", "", entity_id_int, nil)

		q := datastore.NewQuery("Drug").Filter("__key__ =", drugKey)
		t := q.Run(c)
		var result Drug

		for {
			_, err := t.Next(&result)
			if err == datastore.Done {
				result.Id= stringId
				break // No further entities match the query.
			}
			if err != nil {
				c.Errorf("Fetching next Drug: %v", err)
				http.Error(w, err.Error(), http.StatusInternalServerError)
				break
			}
		}

		//get the interactions
		q = datastore.NewQuery("Interaction").Ancestor(drugKey)
		var interactions []Interaction
		interactionKeys, errr := q.GetAll(c, &interactions)
		if errr != nil {
			c.Errorf("Fetching next Interaction: %v", errr)
			http.Error(w, errr.Error(), http.StatusInternalServerError)
		}

		for i, _ := range interactions {
			interactionKey := interactionKeys[i]
			id := strconv.FormatInt(interactionKey.IntID(), 10)
			interactions[i].Id= id
		}
		result.Interactions= interactions
		gorca.WriteJSON(c, w, r, result)

	}

}

func GetDrugById(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	if(clients.ClientIsAdmin(loggedInClient)){

		//Get the Key.
		vars := mux.Vars(r)
		stringId := vars["id"]
		c.Infof("*** stringId: %v", stringId)

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "Drug", "", entity_id_int, nil)


//		c.Infof("*** theKey: %v", key)
		/*
		if err != nil { // Couldn't decode the key
			// Do some error handling
			c.Infof(err.Error());
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		*/

		q := datastore.NewQuery("Drug").Filter("__key__ =", key)
		t := q.Run(c)
		var result Drug

		for {
			//key, err := t.Next(&result)
			_, err := t.Next(&result)
			if err == datastore.Done {
				result.Id= stringId
				//c.Infof("*** got drug: %v: ", result)
				//c.Infof("*** got drug name: %v: ", result.Name)
				gorca.WriteJSON(c, w, r, result)
				break // No further entities match the query.
			}
			if err != nil {
				c.Errorf("Fetching next Drug: %v", err)
				break
			}
		}
	}
}

func GetDrugByName(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)

	//c.Infof("*** in GetDrugByName...")

	if(clients.ClientIsAdmin(loggedInClient) || clients.ClientIsClient(loggedInClient)) {

		//Get the Key.
		vars := mux.Vars(r)
		drugName := vars["drugName"]

		genericDrug := GetDrugByField(c, drugName, "Name")

		if (len(genericDrug.Name) > 0) {
			//c.Infof("Found generic: %v", genericDrug)
			gorca.WriteJSON(c, w, r, genericDrug)
		}else {
			brandNameDrug := GetDrugByField(c, drugName, "BrandNames")
			//c.Infof("Found brand: %v", brandNameDrug)
			gorca.WriteJSON(c, w, r, brandNameDrug)
		}
	}
}

func GetDrugs(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	u := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, u.Email)


	if(clients.ClientIsAdmin(loggedInClient)){
		q := datastore.NewQuery("Drug")
		var drugs []Drug
		//_, err := q.GetAll(c, &drugs)
		keys, err := q.GetAll(c, &drugs)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for idx, key := range keys {
			id := strconv.FormatInt(key.IntID(), 10)
			drugs[idx].Id= id
		}

		//get interactions
		/*
		for idx, key := range keys{
			//c.Infof("*** key: " + strconv.FormatInt(key.IntID(), 10))
			//c.Infof("*** key[%v]: %v: ", idx, key)

			q := datastore.NewQuery("Interaction").Ancestor(key)
			var interactions []Interaction
			_, err := q.GetAll(c, &interactions)
			if err != nil {
				c.Errorf("fetching next Drug: %v", err)
				break
			}
			//c.Infof("*** interactions %v", interactions)
			drugs[idx].Interactions= interactions
		}
		*/
		/*
		for _, drug := range drugs {
			c.Infof("a drug ", drug)
		}
		*/
		gorca.WriteJSON(c, w, r, drugs)
	}else{
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}
}

func Foo(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	//existingDrug := GetDrugByNameField(c, "norco", "Name");
	//c.Infof("*** norco %v", existingDrug)

	q := datastore.NewQuery("Drug").Filter("Name=", strings.ToLower("norco"))
	t := q.Run(c)
	var drug Drug
	for {
		drugKey, err := t.Next(&drug)
		c.Infof("drugKey: %v", drugKey)
		if err == datastore.Done {
			break // No further entities match the query.
		}
		if err != nil {
			c.Errorf("fetching next Drug: %v", err)
			break
		}
		qq := datastore.NewQuery("Interaction").Ancestor(drugKey)
		var interactions []Interaction
		_, errr := qq.GetAll(c, &interactions)
		if errr != nil {
			c.Errorf("fetching next Drug: %v", err)
			break
		}
		c.Infof("*** interactions %v", interactions)
	}

}

func CreateInteractions(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	//u := user.Current(c)
	//log.Println("*** user.Email in CreateDrug: " + u.Email)

	/*
	bytes, _ := ioutil.ReadAll(r.Body)
	c.Infof("*** bytes: " + string(bytes));
	*/

	vars := mux.Vars(r)
	drugName := vars["drugName"]
	//selectedDrugKey := GetDrugKeyByField(c, drugName, "Name");
	//c.Infof("Selected drug's key %+v", selectedDrugKey)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {

		var interactions []Interaction
		defer r.Body.Close()
		dec := json.NewDecoder(r.Body)
		dec.Decode(&interactions)

		//json.Unmarshal(bytes, &interactions)
		//c.Infof("%+v", interactions)

		//var interactionKeys []string
		//var intKeysInt64 []int64

		q := datastore.NewQuery("Drug").Filter("Name=", strings.ToLower(drugName))
		t := q.Run(c)
		var drug Drug
		for {
			selectedDrugKey, err := t.Next(&drug)
			//c.Infof("Selected drug's key %+v", selectedDrugKey)
			if err == datastore.Done {
				break // No further entities match the query.
			}
			if err != nil {
				c.Errorf("fetching next Drug: %v", err)
				break
			}
			// Do something with Person p and Key k
			for _, anInteraction := range interactions {

				anInteractionKey := datastore.NewIncompleteKey(c, "Interaction", selectedDrugKey)
				//c.Infof("anInteractionKey %+v", anInteractionKey)
				_, err = datastore.Put(c, anInteractionKey, &anInteraction)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}
		}

			//c.Infof("Inter: %s", inter);
			/*
			key, err := datastore.Put(c, datastore.NewIncompleteKey(c, "Interaction", nil), &anInteraction)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}else{
				theKey := strconv.FormatInt(key.IntID(), 10)
				//c.Infof("*** key: " + theKey)
				interactionKeys = append(interactionKeys, theKey)
				intKeysInt64= append(intKeysInt64, key.IntID())
			}
			*/
			/*
			anInteractionKey := datastore.NewIncompleteKey(c, "Interaction", selectedDrugKey)
			_, err = datastore.Put(c, anInteractionKey, &anInteraction)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			*/


		//c.Infof("%+v", interactionKeys)
		//c.Infof("%+v", intKeysInt64)


		/*
		existingDrug := GetDrugByNameField(c, d.Name, "Name");
		if (existingDrug.Name == "") {
			_, err := datastore.Put(c, datastore.NewIncompleteKey(c, "Drug", nil), &d)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}else {
			gorca.WriteJSON(c, w, r, existingDrug)
		}
		*/
	}
}


func EditDrug(w http.ResponseWriter, r *http.Request){

	c := appengine.NewContext(r)
	//u := user.Current(c)
	//log.Println("*** user.Email in CreateDrug: " + u.Email)

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

		var theDrug Drug
		//d := new(Drug)
		dec := json.NewDecoder(r.Body)
		dec.Decode(&theDrug)

		//stringId := vars["id"]
		stringId := theDrug.Id;
		//c.Infof("*** stringId: %v", stringId)
		//c.Infof("**** theDrug: %v", theDrug);

		entity_id_int, _ := strconv.ParseInt(stringId, 10, 64)
		key := datastore.NewKey(c, "Drug", "", entity_id_int, nil)

		_, err := datastore.Put(c, key, &theDrug)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}


	}
}


func CreateDrug(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	//u := user.Current(c)
	//log.Println("*** user.Email in CreateDrug: " + u.Email)

	loggedInUser := user.Current(c)
	loggedInClient := clients.GetClientByEmail(c, loggedInUser.Email)

	if(!clients.ClientIsAdmin(loggedInClient)){
		gorca.WriteJSON(c, w, r, http.StatusNotFound)
	}else {

		/*testing
		bytes, _ := ioutil.ReadAll(r.Body)
		c.Infof("*** bytes: " + string(bytes));
		//end testing
		*/

		//new temp drug
		/*
		var drugTemp DrugTemp
		if err := json.NewDecoder(r.Body).Decode(&drugTemp); err != nil {
			// handle error
		}
		*/

		//c.Infof("DrugTemp: %v", drugTemp)

		/*
		var interactions []Interaction
		for _, i := range drugTemp.Interactions {
			interactions = append(interactions, Interaction{DrugName: i[0], SeverityLevel: i[1], Summary: i[2]})
		}
		*/

		//var drug Drug
		/*
		drug := &Drug{Name: drugTemp.Name,
								BrandNames: drugTemp.BrandNames,
								ADRs: drugTemp.ADRs,
								MonitoringParameters: drugTemp.MonitoringParameters,
								Dosages: drugTemp.Dosages}

		c.Infof("Drug: %v", drug)
		*/
		//c.Infof("Interaction: %v", interactions)

		//c.Infof(drug)
		//c.Infof("*** interactions: " + interactions)

		//end temp drug

		defer r.Body.Close()

		var d Drug
		//d := new(Drug)
		dec := json.NewDecoder(r.Body)
		dec.Decode(&d)

		existingDrug := GetDrugByField(c, d.Name, "Name");
		if (existingDrug.Name == "") {
			_, err := datastore.Put(c, datastore.NewIncompleteKey(c, "Drug", nil), &d)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}else {
			gorca.WriteJSON(c, w, r, existingDrug)
		}

	}
}

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
			c.Errorf("error fetching next Drug: %v", err)
			break
		}
		q := datastore.NewQuery("Interaction").Ancestor(key)
		var interactions []Interaction
		_, error := q.GetAll(c, &interactions)
		if error != nil {
			c.Errorf("error fetching Drug: %v", error)
			break
		}
		//c.Infof("*** interactions %v", interactions)
		result.Interactions= interactions
		// Do something with Person p and Key k
		//c.Infof("*** client role: " + client.Role)
	}
	return result
}
