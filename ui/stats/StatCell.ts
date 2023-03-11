namespace stats {

    export class StatCell extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm, "input");
        }

        protected element: HTMLTextAreaElement;

        protected render(): void {
            this.addStyle("stats-StatCell");

            this.element.setAttribute("inputmode", "numeric");
           
            this.element.value = this.model.data["value"];
            this.element.onblur =  e => this.onBlurHandler(e);
            this.element.onfocus = e => this.element.value = "";
            this.element.onkeyup = e => this.onKeyUpHandler(e);
        }

        public update(data: Lookup<string>): void {
            this.setText(data["value"]);
            this.addStyle("stats-StatCell-updated");

            window.setTimeout(()=> {
                this.removeStyle("stats-StatCell-updated");
            }, 1000)

        }

        public setText(text: string): void {
            window.requestAnimationFrame(() => {
                this.element.value = text;
            });
        }

        private onKeyUpHandler(e: KeyboardEvent): void {
            if (e.key === "Enter") {
                this.element.blur();
            }
        }

        private onBlurHandler(e: Event): void {
            const v = this.element.value && this.element.value.trim();

            if (isNaN(+v - parseFloat(v))) {
                this.element.value = this.model.data["value"];
                return;

            } else if (!v) {
                this.element.value = this.model.data["value"];
                return;

            } else if (v == this.model.data["value"]) {
                return;
            }

            const msg = data.newUpdateMsg(this.model.topic, {"value": v});
            this.sendUpdate(msg);
        }

    }
}