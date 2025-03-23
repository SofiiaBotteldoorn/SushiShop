"use strict";
leesArtikels();
async function leesArtikels() {
    const response = await fetch("https://raw.githubusercontent.com/SofiiaBotteldoorn/SushiShop/refs/heads/main/artikels.json");
    if (response.ok) {
        const artikels = await response.json(); //[]met artikels
        verwerkArtikels(artikels);
    } else {
        document.getElementById("nietGevonden").hidden = false;
    }
};

function verwerkArtikels(artikels) {
    const artikelenContainer = document.getElementById("artikelen");
    artikelenContainer.innerHTML = "";
    for (const artikel of artikels) {
        // Kaartje-div
        const kaartjeDiv = document.createElement("div");
        kaartjeDiv.classList.add("col-md-6", "mb-4");

        // ArtikelContainer binnen kaarje
        const artikelDiv = document.createElement("div");
        artikelDiv.classList.add("card-body", "text-center");
        artikelDiv.dataset.artikel = `${artikel.id}`;

        // Productnaam en aantal rolls in set
        const naam = document.createElement("h4");
        naam.classList.add("card-title", "fw-bold", "mt-2");
        naam.innerText = artikel.naam;

        const aantalStuks = document.createElement("div");
        aantalStuks.innerText = `${artikel.aantal} st.`;
        aantalStuks.classList.add("text-muted", "stuks")
        
        // Productafbeelding
        const img = document.createElement("img");
        img.classList.add("product-img", "card-img-top", "mb-2");
        img.src = `img/roll/${artikel.img}`;
        img.alt = artikel.naam;

        const counterPriceWrapper = document.createElement("div");
        counterPriceWrapper.classList.add("details-wrapper");

        // Teller (- teller +)
        const counterWrapper = document.createElement("div");
        counterWrapper.classList.add("items", "counter-wrapper");

        const minusBtn = document.createElement("div");
        minusBtn.classList.add("items-control");
        minusBtn.innerText = "-";
        minusBtn.dataset.action = "min";

        const teller = document.createElement("div");
        teller.classList.add("items-current");
        teller.innerText = "1";
        teller.dataset.counter = "teller";

        const plusBtn = document.createElement("div");
        plusBtn.classList.add("items-control");
        plusBtn.innerText = "+";
        plusBtn.dataset.action = "plus";

        counterWrapper.appendChild(minusBtn);
        counterWrapper.appendChild(teller);
        counterWrapper.appendChild(plusBtn);

        // Prijs naast teller
        const prijs = document.createElement("div");
        prijs.innerText = `€ ${artikel.prijs.toFixed(2)}`;
        prijs.classList.add("prijs", "prijs-currency");

        // Teller en prijs in een wrapper toevoegen
        counterPriceWrapper.appendChild(counterWrapper);
        counterPriceWrapper.appendChild(prijs);
        // Toevoegen aan winkelmandje knop
        const addButton = document.createElement("button");
        addButton.classList.add("btn", "btn-outline-warning", "w-100", "mt-3");
        addButton.innerText = "+ aan maandje";
        addButton.dataset.type = "aanmaandje";

        // Structuur opbouwen
        artikelDiv.appendChild(naam);
        artikelDiv.appendChild(img);
        artikelDiv.appendChild(aantalStuks);
        artikelDiv.appendChild(counterPriceWrapper);
        artikelDiv.appendChild(addButton);
        kaartjeDiv.appendChild(artikelDiv);

        // Voeg de kaart toe aan de container
        artikelenContainer.appendChild(kaartjeDiv);
    }
};
//Artikel aantal verhogen/verlagen of artikel verwijderen
document.addEventListener("click", function (event) {
    let artikelTeller;
    if (event.target.dataset.action === "plus" || event.target.dataset.action === "min") {
        //zoeken teller van artikel
        const artikelKaarje = event.target.closest(".counter-wrapper");
        artikelTeller = artikelKaarje.querySelector("[data-counter]");

        if (event.target.dataset.action === "plus") {

            artikelTeller.innerText = ++artikelTeller.innerText;
        }
        if (event.target.dataset.action === "min") {
            //artikel aantal verlagen mogelijk alleen tot 1
            if (parseInt(artikelTeller.innerText) > 1) {
                artikelTeller.innerText = --artikelTeller.innerText;
            }
                //verwijder artikel uit maandje
            else if (event.target.closest(".maandje-wrapper") && parseInt(artikelTeller.innerText) === 1) {
                event.target.closest(".maandje-item").remove();
                berekenPrijs();
                //meldingen voor lege maandje
                const aantalArtikels = document.querySelector(".maandje-wrapper");
                if (aantalArtikels.children.length === 0) {
                    document.querySelector("[data-maandje-leeg]").hidden = false;
                    document.getElementById("bestelling-form").hidden = true;
                    document.querySelector("[data-maandje-subTotaal]").hidden = true;
                    document.querySelector(".totaal-prijs").innerText = `€ 0.00`;
                    document.querySelector("[data-maandje-bezorging]").hidden = true;
                }
            }
        }
    }
    //Als er op + of - binnen maandje geclickt(artikels kunnen toegevoegd of verwijderd zijn ook vanuit maandje)
    if (event.target.hasAttribute("data-action") && event.target.closest(".maandje-wrapper")) {
        berekenPrijs();
    }
});

const maandje = document.querySelector(".maandje-wrapper");
//Artikel aan maanddje toevoegen(+aanmaandje knop)
document.addEventListener("click", function (event) {
    if (event.target.hasAttribute("data-type")) {
        // Zoeken het artikelkaartje
        const artikelKaartje = event.target.closest(".card-body");

        // Artikel obj
        const artikelInfo = {
            id: artikelKaartje.dataset.artikel,
            naam: artikelKaartje.querySelector(".card-title").innerText,
            imgSrc: artikelKaartje.querySelector(".product-img").src,
            aantalSt: artikelKaartje.querySelector(".stuks").innerText,
            prijs: artikelKaartje.querySelector(".prijs").innerText,
            teller: artikelKaartje.querySelector("[data-counter]").innerText
        };
        //zoek artikel op id
    
        const artikelInMaandje = maandje.querySelector(`[data-id="${artikelInfo.id}"]`);

        if (artikelInMaandje) { //als artikel is al in maandje
            const aantalInMaandje = artikelInMaandje.querySelector(`.items-current`);
            aantalInMaandje.innerText = parseInt(aantalInMaandje.innerText) + parseInt(artikelInfo.teller);
        } else {
            //nieuwe aartikel in maandje 
            const maandjeItemHTML = `<div class="maandje-item" data-id="${artikelInfo.id}">
                                    <div class="maandje-item__top">
                                        <div class="maandje-item__img">
                                            <img src="${artikelInfo.imgSrc}" alt="">
                                        </div>
                                        <div class="maandje-item__desc">
                <div class="maandje-item__title">${artikelInfo.naam}</div>
                <div class="maandje-item__stuks">${artikelInfo.aantalSt}</div>

                <div class="maandje-item__details">
                    <div class="items items--small counter-wrapper">
                        <div class="items-control" data-action="min">-</div>
                        <div class="items-current" data-counter>${artikelInfo.teller}</div>
                        <div class="items-control" data-action="plus">+</div>
                    </div>

                    <div class="prijs">
                        <div class="prijs-currency">${artikelInfo.prijs}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
            //nieuwe artikel onder vorige toonen
            maandje.insertAdjacentHTML("beforeend", maandjeItemHTML);
            document.querySelector("[data-maandje-leeg]").hidden = true; //Leeg melding in maandje verbergen
            document.getElementById("bestelling-form").hidden = false;  //Bestelling knop tonen
            document.querySelector("[data-maandje-subTotaal]").hidden = false;  //subtotaal van artikelen in maaandje tonen
            document.querySelector("[data-maandje-bezorging]").hidden = false;  //bezorging tonen
            
            
        }
        //Teller op kaartje terug op 1 zetten
        artikelKaartje.querySelector("[data-counter]").innerText = "1";
        berekenPrijs();
    }
});

function berekenPrijs() {
    const itemsInMaandje = document.querySelectorAll(".maandje-item");
    //Prijs zonder bezorgings kosten
    let subTotaal = 0;
    let totaalTeBetalen = 0;
    itemsInMaandje.forEach(function (item) {
        const aantalPerArtikel = item.querySelector("[data-counter]").innerText;
        const prijsPerArtikel = item.querySelector(".prijs-currency").innerText.replace("€", "").trim();
        const teBetalenPerArtikel = parseFloat(aantalPerArtikel) * parseFloat(prijsPerArtikel);
        subTotaal += teBetalenPerArtikel;
        console.log("total", subTotaal.toFixed(2));
        //Toon subtotaal in maandje
        document.querySelector(".subtotaal-prijs").innerText = `€ ${subTotaal.toFixed(2)}`;
  
    if (subTotaal >= 40.00) { //vanaf 40euro geen bezorgings kosten
        document.querySelector(".bezorging").innerText = "Gratis";
        document.querySelector(".bezorging").classList.add("free");
        totaalTeBetalen = subTotaal;
        //Toon totaal in maandje
        document.querySelector(".totaal-prijs").innerText = `€ ${totaalTeBetalen.toFixed(2)}`;
    }
    if (subTotaal > 0 && subTotaal < 40) { //Bestellingen onder 40euro hebben bezorgingskosten
        const bezorgingKosts = 10.00;
        document.querySelector(".bezorging").innerText = `€ ${bezorgingKosts}`;
        document.querySelector(".bezorging").classList.remove("free");
        totaalTeBetalen = subTotaal + bezorgingKosts;
        console.log("onder 40:", totaalTeBetalen.toFixed(2));
        document.querySelector(".totaal-prijs").innerText = `€ ${totaalTeBetalen.toFixed(2)}`;
    }
});
    
}
//footer datum
document.getElementById("jaar").innerText = new Date().getFullYear();
