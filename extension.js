import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as Geo from './geo.js';
import * as Risk from './risk.js';

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init(extension) {
            super._init(0.0, 'Brandriskindikator');

            // Create tray icon and set default color
            this._icon = new St.Icon({
                gicon: Gio.icon_new_for_string(`${extension.path}/resources/fire-symbolic.svg`),
                style_class: 'system-status-icon',
            })
            this._setIconcolor(0);

            // Add tray icon
            this.add_child(this._icon);

            // Create menu item that shows location and disable click for now
            this._riskItem = new PopupMenu.PopupMenuItem(_('Hämtar position...'));
            this._riskItem.setSensitive(false);
            this.menu.addMenuItem(this._riskItem);

            // Create container in menu for other information
            this._riskDetailsItem = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
                can_focus: false,
            });

            // Create a box to hold the labels
            let box = new St.BoxLayout({
                vertical: true,
                x_expand: true,
                style_class: 'risk-details-box',
            });

            // Heading - risk level
            this._riskLevelLabel = new St.Label({
                text: "",
                style_class: 'risk-level-label',
                x_expand: true,
            });

            // Risk message
            this._riskMessageLabel = new St.Label({
                text: "",
                style_class: 'risk-message-label',
                x_expand: true,
                y_expand: true,
                reactive: false
            });

            // Make text wrap instead of being truncated
            this._riskMessageLabel.clutter_text.set_line_wrap(true);
            this._riskMessageLabel.clutter_text.set_line_wrap_mode(2);

            // Add labels to the box
            box.add_child(this._riskLevelLabel);
            box.add_child(this._riskMessageLabel);

            // add box to menu item
            this._riskDetailsItem.add_child(box);

            //add the menu item to menu
            this.menu.addMenuItem(this._riskDetailsItem);

            // Try to fetch position
            Geo.getLocation().then(locJson => {
                // If no position is found, set label
                if (!locJson) {
                    // Log unknown position
                    log("Position: unknown!");

                    // Set label text
                    this._riskItem.label.text = _('Okänd position');
                    return;
                }

                // Log position for debug
                log(`Position: ${locJson.lat}, ${locJson.lon} (${locJson.city}, ${locJson.country})`);

                // Set label with city
                this._riskItem.label.text = `Visar brandrisk för ${locJson.city}`;

                // Fetch the risk data and set icon color
                Risk.getRisk(locJson.lat, locJson.lon, 'sv').then(riskJson => {
                    // Set icon color based in risk
                    this._setIconcolor(riskJson.risk);

                    // Set label for risk level
                    this._riskLevelLabel.text = `Brandrisknivå: ${riskJson.risk}`;

                    //set label for message
                    this._riskMessageLabel.text = riskJson.riskMessage;
                });
            });
        }

        _setIconcolor(riskIndex) {
            // default color, gray
            let cssClass = "risk-unknown";

            // Get color based on riskIndex
            switch (riskIndex) {
                case 1: cssClass = "risk1"; break;
                case 2: cssClass = "risk2"; break;
                case 3: cssClass = "risk3"; break;
                case 4: cssClass = "risk4"; break;
                case 5: cssClass = "risk5"; break;
                case 6: cssClass = "risk6"; break;
            }

            if (this._currentClass)
                this._icon.remove_style_class_name(this._currentClass);

            this._icon.add_style_class_name(cssClass);
            this._currentClass = cssClass;
        }
    });

export default class IndicatorExampleExtension extends Extension {
    enable() {
        this._indicator = new Indicator(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
