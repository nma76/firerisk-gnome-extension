/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

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
            super._init(0.0, _('My Shiny Indicator'));

            // local variables
            //this._location = null;

            // Create tray icon and change color to white
            this._icon = new St.Icon({
                gicon: Gio.icon_new_for_string(`${extension.path}/resources/fire-symbolic.svg`),
                style_class: 'system-status-icon',
            })
            this._icon.set_style("color: #fff !important;");

            // Add tray icon
            this.add_child(this._icon);

            // Create menu item and disable click for now
            // this._riskItem = new PopupMenu.PopupMenuItem(_('Hämtar position...'));
            // this._riskItem.setSensitive(false);
            // this.menu.addMenuItem(this._riskItem);

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

                // Store position in local variable
                //this._location = loc;

                Risk.getRisk(locJson.lat, locJson.lon, 'sv').then(riskJson => {
                    // log json for debug
                    log('----------------------------------------------');
                    log(riskJson);

                    // Set icon color based in risk
                    this._setIconcolor(riskJson.risk);
                });

                // Set label with city
                //this._riskItem.label.text = `Visa brandrisk i ${loc.city}`;

                // Enable click since we have a position
                //this._riskItem.setSensitive(true);
                // this._riskItem.connect('activate', () => {
                //     Risk.getRisk(loc.lat, loc.lon, 'sv').then(risk => {
                //         // log json for debug
                //         log('----------------------------------------------');
                //         log(risk);

                //         // Set icon color based in risk
                //         this._setIconcolor(risk.riskIndex);

                //         // Show risk message
                //         Main.notify(risk.riskMessage);
                //     });
                // });
            });
        }

        _setIconcolor(riskIndex) {
            // default color, gray
            let color = "#7a7a7a";

            // Get color based on riskIndex
            switch (riskIndex) {
                case 1: color = "#2ecc71"; break;
                case 2: color = "#f1c40f"; break;
                case 3: color = "#e67e22"; break;
                case 4: color = "#e74c3c"; break;
                case 5: color = "#c0392b"; break;
                case 6: color = "#8e0000"; break;
            }

            // build the style
            let style = `color: ${color} !important;`;

            // log for debug
            log('-------------------------------------');
            log(style);

            // set style
            this._icon.set_style(`color: ${color} !important;`);
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
