import { h } from "preact";

export default function CardNumber(props) {
    return (
        <div>
            <span class={props.text_class}>
                <span class="fw-bolder h1" id="plots">{props.value}</span>
            </span>
        </div>
    )
}
