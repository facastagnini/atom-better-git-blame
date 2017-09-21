'use babel';
import React from 'preact-compat';
import * as ConfigManager from '../ConfigManager';
class SearchInLayer extends React.PureComponent {
    render() {
        if (ConfigManager.get('searchInLayerEnabled')) {
            return (React.createElement("div", { className: "section" },
                React.createElement("div", { className: "section-icon" },
                    React.createElement("div", { className: "icon icon-search" })),
                React.createElement("div", { className: "section-content" },
                    React.createElement("h1", { className: "section-title" },
                        "Search in\u00A0",
                        React.createElement("img", { className: "layer-icon", src: "atom://layer-atom/assets/layer-logo-secondary-64.png", height: "16", alt: "" })),
                    React.createElement("p", { className: "section-body" },
                        "View complete history of the code block",
                        React.createElement("span", { className: "layer-button btn btn-default icon icon-link-external", onClick: this.props.onClick, onMouseEnter: this.props.onMouseEnter, onMouseLeave: this.props.onMouseLeave }, "Open")))));
        }
        return (React.createElement("div", { className: "section powered-by" },
            React.createElement("div", { className: "section-content" },
                React.createElement("p", { className: "section-body" },
                    "Powered by\u00A0",
                    React.createElement("a", { href: "https://stepsize.com" },
                        React.createElement("img", { className: "layer-icon", src: "atom://layer-atom/assets/stepsize-logo-secondary-64.png", height: "16", alt: "" }))))));
    }
}
export default SearchInLayer;
