class CursorManager {
	static showNormal() {
		if(document.body.classList.contains("nocursor")) {
			document.body.classList.remove("nocursor");
		}
		if(document.body.classList.contains("basiccursor")) {
			document.body.classList.remove("basiccursor");
		}
		if(document.body.classList.contains("aimcursor")) {
			document.body.classList.remove("aimcursor");
		}
		if(document.body.classList.contains("minecursor")) {
			document.body.classList.remove("minecursor");
		}
		if(document.body.classList.contains("skillcursor")) {
			document.body.classList.remove("skillcursor");
		}
		if(document.body.classList.contains("foodcursor")) {
			document.body.classList.remove("foodcursor");
		}
	}

	static hide() {
		if(!document.body.classList.contains("nocursor")) {
			document.body.classList.add("nocursor");
		}
	}

	static showBasic() {
		if(!document.body.classList.contains("basiccursor")) {
			document.body.classList.add("basiccursor");
			this._refresh();
		}
	}

	static showAim() {
		if(!document.body.classList.contains("aimcursor")) {
			document.body.classList.add("aimcursor");
			this._refresh();
		}
	}

	static showMine() {
		if(!document.body.classList.contains("minecursor")) {
			document.body.classList.add("minecursor");
			this._refresh();
		}
	}

	static showSkill() {
		if(!document.body.classList.contains("skillcursor")) {
			document.body.classList.add("skillcursor");
			this._refresh();
		}
	}

	static showFood() {
		if(!document.body.classList.contains("foodcursor")) {
			document.body.classList.add("foodcursor");
			this._refresh();
		}
	}

	static _refresh() {
		//document.body.style.cursor = document.body.style.cursor === "crosshair" ? "pointer" : "crosshair";
		//Graphics._canvas.style.cursor = Graphics._canvas.style.cursor === "pointer" ? "crosshair" : "pointer";
		//const ih = document.body.innerHTML;
		//document.body.innerHTML += "<div></div>";
		//document.body.innerHTML = ih;
		//document.body.style.cursor = "crosshair";
		//document.body.style.cursor = "";
		//window.dispatchEvent(new Event('mousemove'));
		//window.scrollBy( 1, 1 );
		//window.scrollBy( -1, -1 );
	}
}