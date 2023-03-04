namespace stats {
    import Component = core.Component;
    
    export class StatDescColumn extends core.DataComponent {
        
        private baseStyle = "stats-StatDescColumn";

        constructor(dm: data.DataModel) {
            super(dm);
        }

        protected render(): void {
            this.addStyle(this.baseStyle);

            const header = new Component()
            header.addStyle(this.baseStyle + "_header");
            
            this.appendChild(header);


            for (const c of this.model.getChildren()) {
                this.appendChild(new StatDescCell(c));
            }
        }

    }
}