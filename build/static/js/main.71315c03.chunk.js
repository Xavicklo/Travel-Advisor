(this["webpackJsonpTravel-Advisor"]=this["webpackJsonpTravel-Advisor"]||[]).push([[0],{130:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a(10),i=a.n(r),c=a(2),s=a(169),l=a(167),o=a(32),d=a(65),u=a(66),p=a.n(u),j=function(){var e=Object(d.a)(Object(o.a)().mark((function e(t,a,n){var r,i;return Object(o.a)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,p.a.get("https://travel-advisor.p.rapidapi.com/".concat(t,"/list-in-boundary"),{params:{bl_latitude:a.lat,bl_longitude:a.lng,tr_longitude:n.lng,tr_latitude:n.lat},headers:{"X-RapidAPI-Key":"b84f9468c9msh7c9d8455324af1ep1c537djsn9173cfde44cd","X-RapidAPI-Host":"travel-advisor.p.rapidapi.com"}});case 3:return r=e.sent,i=r.data.data,e.abrupt("return",i);case 8:e.prev=8,e.t0=e.catch(0),console.log(e.t0);case 11:case"end":return e.stop()}}),e,null,[[0,8]])})));return function(t,a,n){return e.apply(this,arguments)}}(),b=function(){var e=Object(d.a)(Object(o.a)().mark((function e(t,a){var n,r;return Object(o.a)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,!t||!a){e.next=7;break}return e.next=4,p.a.get("https://community-open-weather-map.p.rapidapi.com/find",{params:{lat:t,lon:a},headers:{"X-RapidAPI-Key":"b84f9468c9msh7c9d8455324af1ep1c537djsn9173cfde44cd","X-RapidAPI-Host":"community-open-weather-map.p.rapidapi.com"}});case 4:return n=e.sent,r=n.data,e.abrupt("return",r);case 7:e.next=12;break;case 9:e.prev=9,e.t0=e.catch(0),console.log(e.t0);case 12:case"end":return e.stop()}}),e,null,[[0,9]])})));return function(t,a){return e.apply(this,arguments)}}(),h=a(82),m=a(157),g=a(158),f=a(159),O=a(171),x=a(172),y=a(83),v=a.n(y),w=a(18),C=a(155),k=a(16),N=Object(C.a)((function(e){return{title:Object(w.a)({display:"none"},e.breakpoints.up("sm"),{display:"block"}),search:Object(w.a)({position:"relative",borderRadius:e.shape.borderRadius,backgroundColor:Object(k.a)(e.palette.common.white,.15),"&:hover":{backgroundColor:Object(k.a)(e.palette.common.white,.25)},marginRight:e.spacing(2),marginLeft:0,width:"100%"},e.breakpoints.up("sm"),{marginLeft:e.spacing(3),width:"auto"}),searchIcon:{padding:e.spacing(0,2),height:"100%",position:"absolute",pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"},inputRoot:{color:"inherit"},inputInput:Object(w.a)({padding:e.spacing(1,1,1,0),paddingLeft:"calc(1em + ".concat(e.spacing(4),"px)"),transition:e.transitions.create("width"),width:"100%"},e.breakpoints.up("md"),{width:"20ch"}),toolbar:{background:"linear-gradient(to left, #000046,#1cb5e0)",display:"flex",justifyContent:"space-between"}}})),T=a(5),S=function(e){var t=e.onPlaceChanged,a=e.onLoad,n=N();return Object(T.jsx)(m.a,{position:"static",children:Object(T.jsxs)(g.a,{className:n.toolbar,children:[Object(T.jsx)(f.a,{variant:"h5",className:n.title,children:"Travel Advisor"}),Object(T.jsxs)(O.a,{display:"flex",children:[Object(T.jsx)(f.a,{variant:"h6",className:n.title,children:"Explore new places"}),Object(T.jsx)(h.a,{onLoad:a,onPlaceChanged:t,children:Object(T.jsxs)("div",{className:n.search,children:[Object(T.jsx)("div",{className:n.searchIcon,children:Object(T.jsx)(v.a,{})}),Object(T.jsx)(x.a,{placeholder:"Search\u2026",classes:{root:n.inputRoot,input:n.inputInput}})]})})]})]})})},I=a(165),R=a(166),P=a(175),B=a(170),A=a(176),_=a(160),z=a(161),E=a(162),L=a(174),X=a(163),D=a(164),H=a(84),F=a.n(H),J=a(85),K=a.n(J),U=a(173),W=Object(C.a)((function(){return{chip:{margin:"5px 5px 5px 0"},subtitle:{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"10px"},spacing:{display:"flex",alignItems:"center",justifyContent:"space-between"}}})),q=function(e){var t,a,n,r=e.place,i=e.selected,c=e.refProp;i&&(null===c||void 0===c||null===(t=c.current)||void 0===t||t.scrollIntoView({behavior:"smooth",block:"start"}));var s=W();return Object(T.jsxs)(_.a,{elevation:6,children:[Object(T.jsx)(z.a,{style:{height:350},image:r.photo?r.photo.images.large.url:"https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg",title:r.name}),Object(T.jsxs)(E.a,{children:[Object(T.jsx)(f.a,{gutterBottom:!0,variant:"h5",children:r.name}),Object(T.jsxs)(O.a,{display:"flex",justifyContent:"space-between",my:2,children:[Object(T.jsx)(U.a,{name:"read-only",value:Number(r.rating),readOnly:!0}),Object(T.jsxs)(f.a,{component:"legend",children:[r.num_reviews," review",r.num_reviews>1&&"s"]})]}),Object(T.jsxs)(O.a,{display:"flex",justifyContent:"space-between",children:[Object(T.jsx)(f.a,{component:"legend",children:"Price"}),Object(T.jsx)(f.a,{gutterBottom:!0,variant:"subtitle1",children:r.price_level})]}),Object(T.jsxs)(O.a,{display:"flex",justifyContent:"space-between",children:[Object(T.jsx)(f.a,{component:"legend",children:"Ranking"}),Object(T.jsx)(f.a,{gutterBottom:!0,variant:"subtitle1",children:r.ranking})]}),null===r||void 0===r||null===(a=r.awards)||void 0===a?void 0:a.map((function(e){return Object(T.jsxs)(O.a,{display:"flex",justifyContent:"space-between",my:1,alignItems:"center",children:[Object(T.jsx)("img",{src:e.images.small}),Object(T.jsx)(f.a,{variant:"subtitle2",color:"textSecondary",children:e.display_name})]})})),null===r||void 0===r||null===(n=r.cuisine)||void 0===n?void 0:n.map((function(e){var t=e.name;return Object(T.jsx)(L.a,{size:"small",label:t,className:s.chip},t)})),r.address&&Object(T.jsxs)(f.a,{gutterBottom:!0,variant:"body2",color:"textSecondary",className:s.subtitle,children:[Object(T.jsx)(F.a,{}),r.address]}),r.phone&&Object(T.jsxs)(f.a,{variant:"body2",color:"textSecondary",className:s.spacing,children:[Object(T.jsx)(K.a,{})," ",r.phone]})]}),Object(T.jsxs)(X.a,{children:[Object(T.jsx)(D.a,{size:"small",color:"primary",onClick:function(){return window.open(r.web_url,"_blank")},children:"Trip Advisor"}),Object(T.jsx)(D.a,{size:"small",color:"primary",onClick:function(){return window.open(r.website,"_blank")},children:"Website"})]})]})},M=Object(C.a)((function(e){return{formControl:{margin:e.spacing(1),minWidth:120,marginBottom:"30px"},selectEmpty:{marginTop:e.spacing(2)},loading:{height:"600px",display:"flex",justifyContent:"center",alignItems:"center"},container:{padding:"25px"},marginBottom:{marginBottom:"30px"},list:{height:"75vh",overflow:"auto"}}})),Q=function(e){var t=e.places,a=e.type,r=e.setType,i=e.rating,s=e.setRating,o=e.childClicked,d=e.isLoading,u=Object(n.useState)([]),p=Object(c.a)(u,2),j=p[0],b=p[1],h=M();return Object(n.useEffect)((function(){b((function(e){return Array(t.length).fill().map((function(t,a){return e[a]||Object(n.createRef)()}))}))}),[t]),Object(T.jsxs)("div",{className:h.container,children:[Object(T.jsx)(f.a,{variant:"h6",children:"Search for what you like"}),d?Object(T.jsx)("div",{className:h.loading,children:Object(T.jsx)(I.a,{size:"5rem"})}):Object(T.jsxs)(T.Fragment,{children:[Object(T.jsxs)(R.a,{className:h.formControl,children:[Object(T.jsx)(P.a,{id:"type",children:"Type"}),Object(T.jsxs)(B.a,{id:"type",value:a,onChange:function(e){return r(e.target.value)},children:[Object(T.jsx)(A.a,{value:"restaurants",children:"Restaurants"}),Object(T.jsx)(A.a,{value:"hotels",children:"Hotels"}),Object(T.jsx)(A.a,{value:"attractions",children:"Attractions"})]})]}),Object(T.jsxs)(R.a,{className:h.formControl,children:[Object(T.jsx)(P.a,{id:"rating",children:"Rating"}),Object(T.jsxs)(B.a,{id:"rating",value:i,onChange:function(e){return s(e.target.value)},children:[Object(T.jsx)(A.a,{value:"",children:"All"}),Object(T.jsx)(A.a,{value:"1",children:"1 Star"}),Object(T.jsx)(A.a,{value:"2",children:"2 Stars"}),Object(T.jsx)(A.a,{value:"3",children:"3 Stars"}),Object(T.jsx)(A.a,{value:"4",children:"4 Stars"}),Object(T.jsx)(A.a,{value:"5",children:"5 Stars"})]})]}),Object(T.jsx)(l.a,{container:!0,spacing:3,className:h.list,children:null===t||void 0===t?void 0:t.map((function(e,t){return Object(T.jsx)(l.a,{ref:j[t],item:!0,xs:12,children:Object(T.jsx)(q,{selected:Number(o)===t,refProp:j[t],place:e})},t)}))})]})]})},V=a(88),Z=a(168),G=a(90),Y=a(87),$=a.n(Y),ee=Object(C.a)((function(){return{paper:{padding:"10px",display:"flex",flexDirection:"column",justifyContent:"center",width:"100px"},mapContainer:{height:"85vh",width:"100%"},markerContainer:{position:"absolute",transform:"translate(-50%, -50%)",zIndex:1,"&:hover":{zIndex:2}},pointer:{cursor:"pointer"}}})),te=[{featureType:"administrative",elementType:"labels.text.fill",stylers:[{color:"#444444"}]},{featureType:"landscape",elementType:"all",stylers:[{color:"#f2f2f2"}]},{featureType:"poi",elementType:"all",stylers:[{visibility:"off"}]},{featureType:"road",elementType:"all",stylers:[{saturation:-100},{lightness:45}]},{featureType:"road.highway",elementType:"all",stylers:[{visibility:"simplified"}]},{featureType:"road.arterial",elementType:"labels.icon",stylers:[{visibility:"off"}]},{featureType:"transit",elementType:"all",stylers:[{visibility:"off"}]},{featureType:"water",elementType:"all",stylers:[{color:"#1cb5e0"},{visibility:"on"}]}],ae=function(e){var t,a=e.coords,n=e.places,r=e.setCoords,i=e.setBounds,c=e.setChildClicked,s=e.weatherData,l=Object(Z.a)("(min-width:600px)"),o=ee();return Object(T.jsx)("div",{className:o.mapContainer,children:Object(T.jsxs)(V.a,{bootstrapURLKeys:{key:"AIzaSyBR54Ua34bHFNlCyoXpsIQ2eWJDMEXSqqw"},defaultCenter:a,center:a,defaultZoom:14,margin:[50,50,50,50],options:{disableDefaultUI:!0,zoomControl:!0,styles:te},onChange:function(e){r({lat:e.center.lat,lng:e.center.lng}),i({ne:e.marginBounds.ne,sw:e.marginBounds.sw})},onChildClick:function(e){return c(e)},children:[n.length&&n.map((function(e,t){return Object(T.jsx)("div",{className:o.markerContainer,lat:Number(e.latitude),lng:Number(e.longitude),children:l?Object(T.jsxs)(G.a,{elevation:3,className:o.paper,children:[Object(T.jsxs)(f.a,{className:o.typography,variant:"subtitle2",gutterBottom:!0,children:[" ",e.name]}),Object(T.jsx)("img",{className:o.pointer,src:e.photo?e.photo.images.large.url:"https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg"}),Object(T.jsx)(U.a,{name:"read-only",size:"small",value:Number(e.rating),readOnly:!0})]}):Object(T.jsx)($.a,{color:"primary",fontSize:"large"})},t)})),(null===s||void 0===s||null===(t=s.list)||void 0===t?void 0:t.length)&&s.list.map((function(e,t){return Object(T.jsx)("div",{lat:e.coord.lat,lng:e.coord.lon,children:Object(T.jsx)("img",{src:"http://openweathermap.org/img/w/".concat(e.weather[0].icon,".png"),height:"70px"})},t)}))]})})},ne=function(){var e=Object(n.useState)("restaurants"),t=Object(c.a)(e,2),a=t[0],r=t[1],i=Object(n.useState)(""),o=Object(c.a)(i,2),d=o[0],u=o[1],p=Object(n.useState)({}),h=Object(c.a)(p,2),m=h[0],g=h[1],f=Object(n.useState)(null),O=Object(c.a)(f,2),x=O[0],y=O[1],v=Object(n.useState)([]),w=Object(c.a)(v,2),C=w[0],k=w[1],N=Object(n.useState)([]),I=Object(c.a)(N,2),R=I[0],P=I[1],B=Object(n.useState)([]),A=Object(c.a)(B,2),_=A[0],z=A[1],E=Object(n.useState)(null),L=Object(c.a)(E,2),X=L[0],D=L[1],H=Object(n.useState)(null),F=Object(c.a)(H,2),J=F[0],K=F[1],U=Object(n.useState)(!1),W=Object(c.a)(U,2),q=W[0],M=W[1];Object(n.useEffect)((function(){navigator.geolocation.getCurrentPosition((function(e){var t=e.coords,a=t.latitude,n=t.longitude;g({lat:a,lng:n})}))}),[]),Object(n.useEffect)((function(){var e=_.filter((function(e){return Number(e.rating)>d}));P(e)}),[d]),Object(n.useEffect)((function(){x&&(M(!0),b(m.lat,m.lng).then((function(e){return k(e)})),j(a,x.sw,x.ne).then((function(e){z(e.filter((function(e){return e.name&&e.num_reviews>0}))),P([]),u(""),M(!1)})))}),[x,a]);return Object(T.jsxs)(T.Fragment,{children:[Object(T.jsx)(s.a,{}),Object(T.jsx)(S,{onPlaceChanged:function(){var e=X.getPlace().geometry.location.lat(),t=X.getPlace().geometry.location.lng();g({lat:e,lng:t})},onLoad:function(e){return D(e)}}),Object(T.jsxs)(l.a,{container:!0,spacing:3,style:{width:"100%"},children:[Object(T.jsx)(l.a,{item:!0,xs:12,md:4,children:Object(T.jsx)(Q,{isLoading:q,childClicked:J,places:R.length?R:_,type:a,setType:r,rating:d,setRating:u})}),Object(T.jsx)(l.a,{item:!0,xs:12,md:8,style:{display:"flex",justifyContent:"center",alignItems:"center"},children:Object(T.jsx)(ae,{setChildClicked:K,setBounds:y,setCoords:g,coords:m,places:R.length?R:_,weatherData:C})})]})]})};i.a.render(Object(T.jsx)(ne,{}),document.getElementById("root"))}},[[130,1,2]]]);
//# sourceMappingURL=main.71315c03.chunk.js.map