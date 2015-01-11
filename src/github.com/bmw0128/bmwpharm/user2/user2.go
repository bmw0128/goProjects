package user2

import (
	"appengine"
	"github.com/gorilla/mux"
	"github.com/icub3d/gorca"
	"net/http"
)

// UserInfo is the information about the current user.
type UserInfo struct {
	// The users e-mail address.
	Email string

	// The url to use to log the user out.
	LogoutURL string
}

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
	m.HandleFunc("/", GetUser).Methods("GET")

	// Everything else should 404.
	m.HandleFunc("/{path:.*}", gorca.NotFoundFunc)

	return m
}

// GetUser sends a JSON response with the current user information.
func GetUser(w http.ResponseWriter, r *http.Request) {
	// Get the context.
	c := appengine.NewContext(r)

	// Get the current user.
	u, ok := gorca.GetUserOrUnexpected(c, w, r)
	if !ok {
		return
	}

	// Get their logout URL.
	logout, ok := gorca.GetUserLogoutURL(c, w, r, "/")
	if !ok {
		return
	}

	// Write the user information out.
	gorca.WriteJSON(c, w, r, UserInfo{
		Email:     u.Email,
		LogoutURL: logout,
	})
}
