package bmwpharm

import (
	"fmt"
	"html/template"
	"net/http"

	"appengine"
	"appengine/user"
	_ "appengine/remote_api"

	"github.com/bmw0128/bmwpharm/user2"
	"github.com/bmw0128/bmwpharm/diseases"
	"github.com/bmw0128/bmwpharm/drugs"
	"github.com/bmw0128/bmwpharm/roles"
	"github.com/bmw0128/bmwpharm/clients"
	"github.com/bmw0128/bmwpharm/patients"
	"github.com/bmw0128/bmwpharm/patientGroups"
	"github.com/bmw0128/bmwpharm/assessments"
	//"log"
	//"encoding/json"


)

func init() {

	//log.Println("**** init().... ");

	http.HandleFunc("/", handler)
	http.HandleFunc("/sign", sign)

	//http.HandleFunc("/rest/me", fooHandler)
	//http.HandleFunc("/rest/v1/drugs", fooHandler);
	http.HandleFunc("/rest/auth", handler)
	//http.HandleFunc("/rest/user", handler)
	http.Handle("/rest/v1/drugs/", drugs.MakeMuxer("/rest/v1/drugs/"));
	http.Handle("/rest/v1/drugs/{key}", drugs.MakeMuxer("/rest/v1/drugs"));

	http.Handle("/rest/v1/clients/", clients.MakeMuxer("/rest/v1/clients/"));

	http.Handle("/rest/v1/clients/{key}", clients.MakeMuxer("/rest/v1/clients/"));

	http.Handle("/rest/v1/roles/", roles.MakeMuxer("/rest/v1/roles/"));

	http.Handle("/rest/user/", user2.MakeMuxer("/rest/user/"))

	http.Handle("/rest/v1/diseases/", diseases.MakeMuxer("/rest/v1/diseases/"))

	http.Handle("/rest/v1/patients/", patients.MakeMuxer("/rest/v1/patients/"))

	http.Handle("/rest/v1/patientGroups/", patientGroups.MakeMuxer("/rest/v1/patientGroups/"))

	http.Handle("/rest/v1/assessments/", assessments.MakeMuxer("/rest/v1/assessments/"))


}

func fooHandler(w http.ResponseWriter, r *http.Request){

	//log.Println("**** fooHandler.... ");
	if(r.Method == "POST"){
		//this FormValue call does not work
		//log.Println("**** POST: " + r.FormValue("name"));

	}else{
		//log.Println("**** NOT a POST.... ");
	}
}

func handler(w http.ResponseWriter, r *http.Request) {

	//log.Println("*** handler()....")
	c := appengine.NewContext(r)
	u := user.Current(c)

	if u == nil {
		//log.Println("*** user is nil")
		url, err := user.LoginURL(c, r.URL.String())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Location", url)
		w.WriteHeader(http.StatusFound)

		//log.Println("*** user: " + u.Email);
		return
	}

	root(w, r, c)
}

func root(w http.ResponseWriter, r *http.Request, c appengine.Context) {

	logoutURL, _ := user.LogoutURL(c, "/")
	fmt.Fprintf(w, guestbookForm, logoutURL)

}

const guestbookForm = `<html><body><form action="/sign" method="post">
						<div><textarea name="content" rows="3" cols="60"></textarea></div>
      					<div><input type="submit" value="Sign Guestbook"></div>
    					</form>

    					<br/>
    					<a href=%v>logout</a>

    					</body></html>`

func sign(w http.ResponseWriter, r *http.Request) {

	err := signTemplate.Execute(w, r.FormValue("content"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

var signTemplate = template.Must(template.New("sign").Parse(signTemplateHTML))

const signTemplateHTML = `<html><body>
    						<p>You wrote:</p>
    						<pre>{{.}}</pre>
  							</body></html>`
