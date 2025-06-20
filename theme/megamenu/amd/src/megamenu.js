// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Mega menu functionality for theme_megamenu.
 *
 * @module     theme_megamenu/megamenu
 * @copyright  2024 Your Name
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['jquery', 'core/throttle'], function($, Throttle) {
    'use strict';

    /**
     * Initialize mega menu functionality
     */
    const init = function() {
        const megaMenuItems = document.querySelectorAll('.megamenu-item');
        let activeMenu = null;
        let closeTimeout = null;

        /**
         * Show mega menu panel
         * @param {HTMLElement} menuItem The menu item element
         */
        const showMegaMenu = function(menuItem) {
            // Close any active menu first
            if (activeMenu && activeMenu !== menuItem) {
                hideMegaMenu(activeMenu);
            }

            const toggle = menuItem.querySelector('[data-megamenu-toggle]');
            const panelId = 'megamenu-' + toggle.getAttribute('data-megamenu-toggle');
            const panel = document.getElementById(panelId);

            if (panel) {
                // Clear any pending close timeout
                if (closeTimeout) {
                    clearTimeout(closeTimeout);
                    closeTimeout = null;
                }

                toggle.classList.add('active');
                panel.classList.add('show');
                panel.classList.add('animate-in');
                activeMenu = menuItem;

                // Position panel if needed (for edge cases)
                positionPanel(menuItem, panel);
            }
        };

        /**
         * Hide mega menu panel
         * @param {HTMLElement} menuItem The menu item element
         */
        const hideMegaMenu = function(menuItem) {
            const toggle = menuItem.querySelector('[data-megamenu-toggle]');
            const panelId = 'megamenu-' + toggle.getAttribute('data-megamenu-toggle');
            const panel = document.getElementById(panelId);

            if (panel) {
                toggle.classList.remove('active');
                panel.classList.remove('show');
                panel.classList.remove('animate-in');
                activeMenu = null;
            }
        };

        /**
         * Position panel to ensure it's within viewport
         * @param {HTMLElement} menuItem The menu item element
         * @param {HTMLElement} panel The panel element
         */
        const positionPanel = function(menuItem, panel) {
            const rect = menuItem.getBoundingClientRect();
            const panelRect = panel.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Reset any custom positioning first
            panel.style.left = '';
            panel.style.transform = 'translateX(-50%)';

            // Check if panel extends beyond viewport
            if (panelRect.left < 0) {
                // Align to left edge of viewport
                panel.style.left = '0';
                panel.style.transform = 'none';
            } else if (panelRect.right > viewportWidth) {
                // Align to right edge of viewport
                panel.style.left = 'auto';
                panel.style.right = '0';
                panel.style.transform = 'none';
            }
        };

        // Set up event listeners for each mega menu item
        megaMenuItems.forEach(function(menuItem) {
            const toggle = menuItem.querySelector('[data-megamenu-toggle]');
            const panelId = 'megamenu-' + toggle.getAttribute('data-megamenu-toggle');
            const panel = document.getElementById(panelId);

            if (!panel) {
                return; // Skip if no panel found
            }

            // Mouse enter on menu item
            menuItem.addEventListener('mouseenter', function() {
                showMegaMenu(menuItem);
            });

            // Mouse leave from menu item
            menuItem.addEventListener('mouseleave', function() {
                // Delay closing to allow mouse to move to panel
                closeTimeout = setTimeout(function() {
                    hideMegaMenu(menuItem);
                }, 100);
            });

            // Mouse enter on panel
            panel.addEventListener('mouseenter', function() {
                // Clear close timeout when entering panel
                if (closeTimeout) {
                    clearTimeout(closeTimeout);
                    closeTimeout = null;
                }
            });

            // Mouse leave from panel
            panel.addEventListener('mouseleave', function() {
                hideMegaMenu(menuItem);
            });

            // Touch/click support for mobile
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (menuItem === activeMenu) {
                    hideMegaMenu(menuItem);
                } else {
                    showMegaMenu(menuItem);
                }
            });
        });

        // Close mega menu when clicking outside
        document.addEventListener('click', function(e) {
            if (activeMenu && !activeMenu.contains(e.target)) {
                const toggle = activeMenu.querySelector('[data-megamenu-toggle]');
                const panelId = 'megamenu-' + toggle.getAttribute('data-megamenu-toggle');
                const panel = document.getElementById(panelId);

                if (!panel.contains(e.target)) {
                    hideMegaMenu(activeMenu);
                }
            }
        });

        // Handle window resize
        const handleResize = Throttle.throttle(function() {
            if (activeMenu) {
                const toggle = activeMenu.querySelector('[data-megamenu-toggle]');
                const panelId = 'megamenu-' + toggle.getAttribute('data-megamenu-toggle');
                const panel = document.getElementById(panelId);
                positionPanel(activeMenu, panel);
            }
        }, 100);

        window.addEventListener('resize', handleResize);

        // Keyboard navigation support
        megaMenuItems.forEach(function(menuItem) {
            const toggle = menuItem.querySelector('[data-megamenu-toggle]');
            
            toggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (menuItem === activeMenu) {
                        hideMegaMenu(menuItem);
                    } else {
                        showMegaMenu(menuItem);
                    }
                } else if (e.key === 'Escape' && menuItem === activeMenu) {
                    hideMegaMenu(menuItem);
                    toggle.focus();
                }
            });
        });

        // Add keyboard navigation within panels
        document.querySelectorAll('.megamenu-panel').forEach(function(panel) {
            const links = panel.querySelectorAll('a');
            
            panel.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && activeMenu) {
                    hideMegaMenu(activeMenu);
                    activeMenu.querySelector('[data-megamenu-toggle]').focus();
                }
            });

            // Trap focus within panel when using Tab
            if (links.length > 0) {
                const firstLink = links[0];
                const lastLink = links[links.length - 1];

                lastLink.addEventListener('keydown', function(e) {
                    if (e.key === 'Tab' && !e.shiftKey) {
                        e.preventDefault();
                        firstLink.focus();
                    }
                });

                firstLink.addEventListener('keydown', function(e) {
                    if (e.key === 'Tab' && e.shiftKey) {
                        e.preventDefault();
                        lastLink.focus();
                    }
                });
            }
        });
    };

    return {
        init: init
    };
});