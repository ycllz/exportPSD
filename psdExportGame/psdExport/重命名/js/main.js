/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
    'use strict';

    var csInterface = new CSInterface();
    
    
    function init() {
        
        themeManager.init();
        
        //csInterface.evalScript('./jsx/daddy.jsx');
        
        $("#btn_test").click(function () {
            csInterface.evalScript('sayHello()');
        });
        $("#btn_out").click(function () {
            //alert("out put");
            csInterface.evalScript('initData()');
        });
    }
        
    init();

}());
    
