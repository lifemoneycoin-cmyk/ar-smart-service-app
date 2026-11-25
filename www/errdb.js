/* AR Smart Service – Error code guide (general information).
   Format: [code, meaning, possible causes (separated by |), checks/fixes (separated by |)]
   The meaning of the code may vary slightly by model/series – always refer to the service manual of that same model.
   New/improved codes in admin app "Error code" can be linked to pages (they get linked with this list). */
window.ERRDB={
types:[{id:'ac',n:'AC',ic:'❄️'},{id:'wm',n:'Washing machine',ic:'🧺'},{id:'fr',n:'Fridge',ic:'🧊'},{id:'ch',n:'Water chiller',ic:'💧'}],
data:{
ac:{
'LG':[
['CH01','Fault in indoor room temperature sensor (open/short)','Sensor or its connector loose|Sensor faulty|Problem in indoor PCB','Reconnect the sensor connector|Check sensor resistance with a multimeter|Replace the sensor if faulty|If still not cleared, check the indoor PCB'],
['CH02','Indoor pipe (inlet) sensor fault','Pipe sensor loose/faulty|Wiring broken','Fix the sensor properly on the copper pipe|Check resistance|Replace the sensor'],
['CH03','Remote/receiver related error','Receiver board faulty|Wiring loose','Check connection of receiver/display board|Replace board'],
['CH04','Drain (water removal)/float switch error','Drain pipe clogged|Drain pump faulty|Float switch stuck','Clean drain pipe|Check drain pump and float switch'],
['CH05','Indoor–outdoor communication error','Connecting wire loose/damaged|Outdoor PCB fault|Supply voltage problem','Check terminal wiring of both units|Check supply at the outdoor unit|Replace the wire|Check PCB'],
['CH06','Indoor pipe (outlet) sensor fault','Sensor faulty/loose','Check sensor and connector|Measure resistance|Replace'],
['CH07','Indoor/outdoor operating modes do not match','Mode of both units differs|PCB setting','Check mode/jumper settings|Check PCB'],
['CH09','Indoor EEPROM error','EEPROM data corrupt|PCB fault','Reset power and check|Replace EEPROM/PCB'],
['CH10','Indoor fan motor (BLDC) locked/error','Fan motor faulty|Blower jammed|Motor connector loose','Turn the blower by hand and check|Check motor connector|Replace motor'],
['CH21','Compressor DC peak / IPM fault','Outdoor inverter PCB fault|Compressor short|Voltage fluctuation','Check supply voltage|Measure compressor terminal resistance|Check PCB/IPM'],
['CH22','Outdoor current (CT) high','Compressor overload|Condenser blocked/dirty|Low voltage','Clean condenser coil|Check gas pressure|Check voltage'],
['CH23','DC link voltage low','Low supply voltage|Outdoor PCB fault','Check input voltage|Install stabilizer|Check PCB'],
['CH26','Outdoor compressor position/start error','Compressor not starting|Compressor wiring|Inverter PCB','Check resistance of all three compressor terminals|Check wiring|Check PCB'],
['CH32','Compressor discharge pipe overheating','Low gas|Low airflow at condenser|Fan faulty','Check gas and leakage|Clean condenser|Check outdoor fan'],
['CH38','Refrigerant (gas) low / leakage','Gas leakage|Leak from service valve/flare','Do a leak test|After fixing the leak, evacuate with vacuum and charge the correct amount of gas'],
['CH44','Outdoor air temperature sensor faulty','Sensor faulty/loose','Check sensor and connector|Replace'],
['CH45','Outdoor condenser pipe sensor faulty','Sensor faulty/loose','Check sensor and wiring|Replace'],
['CH46','Outdoor suction pipe sensor faulty','Sensor faulty/loose','Check sensor and wiring|Replace'],
['CH53','No signal from outdoor to indoor (communication)','Connecting wire|Outdoor PCB','Check wiring and supply|Check PCB']
],
'Samsung':[
['E101','Indoor–outdoor communication error','Connecting wire loose/damaged|Outdoor PCB fault|Power problem','Check wiring and terminals of both units|Check outdoor supply|Check PCB'],
['E121','Fault in indoor room sensor','Sensor open/short|Connector loose','Check sensor connector|Measure resistance|Replace'],
['E122','Fault in indoor evaporator (inlet) sensor','Sensor faulty|Connector loose','Check and replace sensor'],
['E123','Fault in indoor evaporator (outlet) sensor','Sensor faulty|Connector loose','Check and replace sensor'],
['E154','Indoor fan motor error','Fan motor faulty|Motor connector loose|Blower jammed','Turn blower and check|Check connector|Replace motor'],
['E162','Indoor EEPROM error','EEPROM/PCB fault','Reset power|Replace PCB/EEPROM'],
['E221','Outdoor air temperature sensor faulty','Sensor faulty|Connector loose','Check and replace sensor'],
['E237','Outdoor condenser coil sensor faulty','Sensor faulty|Wiring','Check and replace sensor'],
['E251','Outdoor discharge sensor faulty','Sensor faulty|Wiring','Check and replace sensor'],
['E416','Compressor overheat','Low gas|Dirty condenser|Fan faulty','Check gas pressure and leakage|Clean condenser|Check fan'],
['E464','Outdoor IPM / over-current','Inverter PCB fault|Compressor short|Voltage problem','Check supply|Measure compressor resistance|Check PCB'],
['E465','Compressor not starting','Compressor wiring|Compressor jammed|Inverter PCB','Check terminal resistance|Check wiring|Check PCB']
],
'Voltas':[
['E1','Room temperature sensor fault (general)','Sensor faulty|Connector loose','Check sensor connector|Replace sensor'],
['E2','Indoor coil sensor fault (general)','Sensor faulty|Connector loose','Check sensor connector|Replace sensor'],
['E4','Indoor–outdoor communication error (general)','Wiring|PCB','Check connecting wire and supply|Check PCB']
],
'Daikin':[
['U4','Indoor–outdoor transmission (communication) error','Loose/damaged wiring|PCB fault','Check terminal wiring|Check both PCBs'],
['A5','High pressure control / freeze-up protection','Air filter dirty|Low airflow|Low gas','Clean filter and coil|Check gas'],
['A6','Fault in indoor fan motor','Fan motor faulty|Blower jammed','Check motor and connector|Replace'],
['C4','Indoor heat exchanger (liquid pipe) sensor faulty','Sensor faulty|Connector loose','Check and replace sensor'],
['C9','Indoor room sensor faulty','Sensor faulty|Connector loose','Check and replace sensor'],
['E5','Compressor overload / motor locked','Compressor problem|Dirty condenser|Voltage','Clean condenser|Check compressor current'],
['F3','Discharge pipe temperature high','Low gas|Valve blockage','Check gas pressure and leakage'],
['L5','Over-current in inverter compressor','IPM/compressor short|Voltage problem','Check compressor and IPM|Check supply']
],
'Hitachi':[],'Blue Star':[],'Carrier':[],'Whirlpool':[],'Lloyd':[],'Godrej':[],'Panasonic':[]
},
wm:{
'LG':[
['IE','Water not entering (inlet error)','Tap off/low water|Inlet filter jammed|Inlet valve faulty','Fully open the tap|Clean the inlet pipe mesh|Check valve'],
['OE','Water not draining out (drain error)','Drain pipe bent/clogged|Drain pump filter jammed|Pump faulty','Straighten drain pipe|Clean pump filter|Check pump'],
['UE','Unbalanced clothes load','Clothes bunched to one side|Load too low/high|Machine not level','Spread clothes and reload|Level the machine using the feet'],
['dE','Door not closed / door lock error','Door not closed properly|Door lock faulty','Close the door firmly by pressing|Check lock switch'],
['PE','Water level (pressure) sensor error','Pressure sensor/pipe blocked|Sensor faulty','Clean pressure tube|Replace sensor'],
['FE','Water overfilled','Inlet valve stuck|Pressure sensor faulty','Turn off tap and reset power|Check valve/sensor'],
['LE','Motor lock / motor error','Motor or carbon brush|Clothes stuck|Loose wiring','Turn the drum by hand and check|Check motor connector|Check motor/PCB'],
['tE','Heater/thermistor error','Thermistor or heater faulty','Check thermistor and heater resistance|Replace'],
['CL','Child lock on','Child lock pressed','Remove child lock by pressing the button for 3 seconds']
],
'Samsung':[
['4C','Water not entering (water supply error)','Tap off|Inlet filter jammed|Valve faulty','Check tap and pipe|Clean filter|Check valve'],
['5C','Water not draining out (drain error)','Drain pipe clogged|Pump filter jammed|Pump faulty','Clean pipe and filter|Check pump'],
['UB','Unbalanced clothes load','Clothes on one side|Machine not level','Spread clothes evenly|Level the machine'],
['DC','Door open / door error','Door not closed properly|Door lock faulty','Close door|Check lock'],
['HC','Heater / temperature error','Heater or temperature sensor faulty','Check heater and sensor'],
['1C','Water level sensor error','Level sensor/tube blocked','Clean tube|Replace sensor'],
['3C','Motor error','Motor/drive PCB|Wiring','Check motor connector|Check PCB'],
['LC','Water leakage signal','Water collecting underneath|Pipe connection','Check pipe/tub connections and dry']
],
'Bosch':[
['E17','Water not entering','Tap off|Inlet filter jammed','Open tap|Clean filter'],
['E18','Water not draining out','Drain pump/pipe jammed','Clean pump filter and pipe'],
['E01','Door lock error','Door lock/connector faulty','Close door properly|Check lock'],
['E23','Water leakage (Aqua-stop)','Leak from tub or pipe|Water collecting underneath','Fix leak|Dry the bottom tray']
],
'IFB':[],'Whirlpool':[],'Godrej':[],'Haier':[],'Panasonic':[],'Videocon':[]
},
fr:{'LG':[],'Samsung':[],'Whirlpool':[],'Godrej':[],'Haier':[]},
ch:{'Blue Star':[],'Voltas':[],'Usha':[]}
}
};
