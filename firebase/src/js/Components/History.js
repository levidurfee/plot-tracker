import { h } from "preact";

export default function History(props) {
    if(!props.history) {
        return;
    }

    let ctr = 0;
    return (
        <div class="bg-card card w-100">
            <div class="card-header">Eligibility History</div>
            <div class="card-body">
                <svg class="mw-100" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 590 15">
                    {props.history.map((v, i) => {
                        let fillColor = "#CCCCCC";
                        if(v == true) {
                            ctr++;
                            fillColor = "#3bd671";
                        }
                        return (
                            <rect height="15" width="3.25" fill={fillColor} y="0" x={5.9 * i}></rect>
                        )
                    })}
                </svg>
            </div>
            <div class="card-footer">
                <small>Last 100 signage points ({ctr}% were eligible)</small>
            </div>
        </div>
    )
}
