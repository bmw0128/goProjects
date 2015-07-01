package drugs

import(
	"testing"
	"fmt"
	"strings"
	"github.com/bmw0128/bmwpharm/drugs"
)

func TestGetNextLetterInAlphabet(t *testing.T){

	/*
	letter := drugs.GetNextLetterInAlphabet('c')
	if(letter != 'd') {
		t.Error("error...")
	}
	*/
	x := drugs.GetNextLetterInAlphabet('s')
	b := strings.Contains("aa", "a")
	fmt.Printf("*** fmt: %v" , x)
	t.Errorf("*** result: %v", b)

}
