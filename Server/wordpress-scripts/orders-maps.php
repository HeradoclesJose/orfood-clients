<?php
// this script needs plugin Woody Snippets (php script get-all-orders-from-user)

$args = array(
    'customer_id' => get_current_user_id(),
	'status' =>'sending'
);
$query = new WC_Order_Query( $args );
$orders = $query->get_orders();
$arrayOptions=[];

foreach($orders as $key=>$value)
{
	//var_dump(get_current_user_id());
		echo '<script>console.log('.$orders[$key].')</script>';
		//echo '<script>console.log('.$orders[$key].')</script>';
		
	
		
	//if(strcmp($orders[$key]->get_status(),'sending')){
		
	$arrayOptions[$key]=$orders[$key]->id;	
	//}
	
}

echo "<script>
	const socket = io('http://165.22.186.58:60000');
	let myDiv = document.getElementById('myDiv'); 
	let buttonDiv = document.getElementById('buttonDiv');
	let selectList = document.createElement('select'); 
	selectList.id = 'mySelect'; 
	selectList.className = 'selectStyle';
	myDiv.appendChild(selectList);
	let array = ".json_encode($arrayOptions).";

	for (let i = 0; i < array.length; i++) { 

		let option = document.createElement('option'); 
		option.value = array[i]; 
		option.text = array[i]; 
		selectList.appendChild(option); 
	}
	
	let btn = document.createElement('input');
    btn.setAttribute('type', 'button'); 
    btn.setAttribute('value', '  Rastreo  ');
	btn.onclick = joinSocket;
	btn.className='buttonStyle'



    function joinSocket(){
		if(marker !==undefined){	
			marker.setMap(null);
			marker='';
			markers=[];
		}
		
		if(destinationMarker !== undefined){
			destinationMarker.setMap(null);
			destinationMarker='';
		}
		let order = $('#mySelect :selected').val();
        console.log('join with order ' + order);
        let data = {
			order:order
		}
		socket.emit('join', JSON.stringify(data));
    }

	socket.on('newLocation',(data)=>{
		console.log(data);
        //map.setMapOnAll(null);
		
    		btn.setAttribute('value', '  Rastreo  ');
			btn.onclick = joinSocket;
			btn.className='buttonStyle'
			
		console.log('data lat ', Number(data.lat));
		console.log('data long ', Number(data.long))
		let latD = data.lat;
		let lngD = data.long;
		if(isNaN(data.lat)){
			
			latD = 40.4378698; 
			lngD = -3.8196207;
		}else{
			latD = parseFloat(data.lat);
			lngD = parseFloat(data.long);
		}
		
		let deliveryGuyPosition ={lat:latD,lng:lngD};
		
		let destinationPosition = {lat: parseFloat(data.latDes),lng:parseFloat(data.lngDes)};
		console.log('deliveryGuyPosition ', deliveryGuyPosition);
		console.log('destinationPosition ', destinationPosition)
		  
		 		destinationMarker = new google.maps.Marker({
          		position: destinationPosition,
          		map: map,
          		title: 'Destino',
				icon:{
					url:'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
					
					
				}
        		});

		
		if (!Array.isArray(markers) || !markers.length) {
  			console.log('in if not array ', markers.length);
				marker = new google.maps.Marker({
          		position: deliveryGuyPosition,
          		map: map,
          		title: 'Repartidor',
				icon:{
					url:'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
					scaledSize: new google.maps.Size(50, 50)
				}
        		});
				markers.push(marker);
				map.setZoom(14);
				//marker.setMap(map);
				//destinationMarker.setMap(map);
				
			
		//console.log('destinationMarker ', destinationMarker);
		}else{
			let latlng = new google.maps.LatLng(latD, 	lngD);
    		marker.setPosition(latlng);
		}
		
		map.setCenter(deliveryGuyPosition);
		console.log('marker ', marker);
		console.log('destination ', destinationMarker)
	})
	    buttonDiv.appendChild(btn);
	console.log('check', socket.id);

	</script>";

?>