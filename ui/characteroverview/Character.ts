namespace characteroverview {

    import DataComponent = core.DataComponent;
    import Component = core.Component;

    export class Character extends DataComponent {

        private baseStyle = "co-Character";
        
        protected render(): void {
            this.addStyle(this.baseStyle);

            const header = new Component();
            header.addStyle(this.baseStyle + "_Header");
            this.appendChild(header);

            const image = new Component();
            image.addStyle(this.baseStyle + "_Image");
            image.getElement().setAttribute("style", `background-image:url("${this.model.data["img"]}")`)
            header.appendChild(image);

            const detailsWrapper = new Component();
            detailsWrapper.addStyle(this.baseStyle + "_Details");
            header.appendChild(detailsWrapper);

            const name = new Component();
            name.addStyle(this.baseStyle + "_Name");
            name.setText(this.model.data["name"] + " " + this.model.data["secondname"] || "");
            detailsWrapper.appendChild(name);

            const classDetails = new Component();
            classDetails.addStyle(this.baseStyle + "_ClassDetails");
            detailsWrapper.appendChild(classDetails);

            const level = new Component();
            level.addStyle(this.baseStyle + "_Level");
            level.setText(`Level: ${this.model.data["level"]}`);
            classDetails.appendChild(level);

            const classDetailsDivider = new Component();
            classDetailsDivider.addStyle(this.baseStyle + "_ClassDetailsDivider");
            classDetailsDivider.setText("|");
            classDetails.appendChild(classDetailsDivider);
            
            const race = new Component();
            race.addStyle(this.baseStyle + "_Race");
            race.setText(this.model.data["race"]);
            classDetails.appendChild(race);

            const classDescription = new Component();
            classDescription.addStyle(this.baseStyle + "_ClassDescription");
            classDescription.setText(this.model.data["class"]);
            detailsWrapper.appendChild(classDescription);
        }

    }
}