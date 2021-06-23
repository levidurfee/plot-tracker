import { h, Component } from "preact";

export default class DocumentName extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: this.props.doc.data().name,
        };
    }

    render() {
        return (
            <div>
                <input class="form-control bg-dark text-light border-0 mono" value={this.state.name} onChange={this.onChange} />
            </div>
        )
    }

    onChange = e => {
        this.setState({
            name: e.target.value
        });
        var db = firebase.firestore();
        db.collection(this.props.collection).doc(this.props.doc.id).update({
            name: e.target.value
        }).then(() => {
            toastr.success("Saved");
        });
    };
}
