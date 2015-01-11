package txline

type TxLine struct{
	Id int
	Name string
}

func loadTxLines() []TxLine{

	first := TxLine{
		Id: 1,
		Name: "1st",
	}
	second := TxLine{
		Id: 2,
		Name: "2nd",
	}
	tertiary := TxLine{
		Id: 3,
		Name: "tertiary",
	}
	adjunct := TxLine{
		Id: 4,
		Name: "adjunct",
	}

	return []TxLine{
		first, second,
		tertiary, adjunct,
	}

}
