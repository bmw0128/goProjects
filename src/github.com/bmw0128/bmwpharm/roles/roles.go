package roles

import(
	"net/http"
	"appengine"
	"appengine/user"
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	//"log"
	//"encoding/json"
)

func MakeMuxer(prefix string) http.Handler {

	//log.Println("**** roles.MakeMuxer(): " + prefix);

	var m *mux.Router

	// Pass through the prefix if we have one.
	if prefix == "" {
		m = mux.NewRouter()
	} else {
		m = mux.NewRouter().PathPrefix(prefix).Subrouter()
	}

	m.HandleFunc("/", GetRoles).Methods("GET")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

func GetRoles(w http.ResponseWriter, r *http.Request) {

	c := appengine.NewContext(r)
	//u := user.Current(c)
	if(user.IsAdmin(c)) {
		c.Infof("is admin")
	}else {
		c.Infof("is NOT admin")
    }

	var roles = make([]Role, 0)

	doctor := Role{
		Name: "doctor",
	}
	student := Role{
		Name: "student",
	}

	roles= append(roles, doctor);
	roles= append(roles, student)
	gorca.WriteJSON(c, w, r, roles)

}

type Role struct {
	Name string `json:"name"`

}
