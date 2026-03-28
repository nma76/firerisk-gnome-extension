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
import St from 'gi://St';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as Geo from './geo.js';

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('My Shiny Indicator'));

            // local variables
            this._location = null;

            // Add tray icon
            this.add_child(new St.Icon({
                icon_name: 'face-smile-symbolic',
                style_class: 'system-status-icon',
            }));

            // Create menu item and disable click for now
            this._riskItem = new PopupMenu.PopupMenuItem(_('Hämtar position...'));
            this._riskItem.setSensitive(false);
            this.menu.addMenuItem(this._riskItem);

            // Try to fetch position
            Geo.getLocation().then(loc => {
                // If no position is found, set label
                if (!loc) {
                    // Log unknown position
                    log("Position: unknown!");

                    // Set label text
                    this._riskItem.label.text = _('Okänd position');
                    return;
                }

                // Log position for debug
                log(`Position: ${loc.lat}, ${loc.lon} (${loc.city}, ${loc.country})`);

                // Store position in local variable
                this._location = loc;

                // Set label with city
                this._riskItem.label.text = `Visa brandrisk i ${loc.city}`;

                // Enable click since we have a position
                this._riskItem.setSensitive(true);
                this._riskItem.connect('activate', () => {
                    Main.notify(`Din ungefärliga position är ${loc.lat}, ${loc.lon} - ${loc.city}, ${loc.country}`);
                });
            });
        }
    });

export default class IndicatorExampleExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
