import { h, Component } from "preact";
import { uuidv4 } from "../functions";
import DocumentName from "./DocumentName";

export default class AddFarmer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            keys: [],
        };

        this.create = this.create.bind(this);
    }
    render() {
        return (
            <div>
                <div class="card bg-primary">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            Farm Keys
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-light" onClick={this.create}><i class="fal fa-plus-square"></i> New</button>
                        </div>
                    </div>
                </div>
                {this.state.keys.map((v, i) => {
                    return v;
                })}
            </div>
        )
    }

    create() {
        var db = firebase.firestore();
        db.collection("farms").add({
            key: uuidv4(),
            uid: this.props.user.uid,
            name: "My Farm",
        }).then(ref => {
            console.log(ref.id);
            this.update();
        })
            ;
    }

    componentDidMount() {
        this.update();
    }

    update() {
        var db = firebase.firestore();

        db.collection("farms").where("uid", "==", this.props.user.uid).get().then((querySnapshot) => {
            let data = [];
            querySnapshot.forEach((doc) => {
                data.push(<div class="card bg-dark mt-3" key={doc.id}>
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <DocumentName
                            collection="farms"
                            doc={doc}
                        />
                        <button class="btn btn-outline-danger" onClick={() => this.removeKey(doc.id)}><i class="fal fa-trash-alt"></i></button>
                    </div>
                    <div class="card-body">
                        <input class="form-control bg-dark text-light border-0 mono" key={doc.id} value={doc.data().key} readonly />
                    </div>
                </div>)
            });
            this.setState({ keys: data });
        });
    }

    removeKey(id) {
        var db = firebase.firestore();

        db.collection("farms").doc(id).delete().then(() => {
            this.update();
        })
    }
}
