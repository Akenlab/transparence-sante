const infosLegalesTitle = document.evaluate("//p[text()='Numéro RPPS']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
const infosLegales: ChildNode = infosLegalesTitle?.parentElement.lastChild;
const rrps = infosLegales?.textContent;
if (rrps) {
    const parentChezDocto = document.querySelector(".dl-profile-booking-card-wrapper .dl-card-content .p-16");
    const style = document.createElement("style");
    style.textContent = `
    .tsp-extension {
        background: rgba(230,255,230,.8);
        padding: 5px;
        margin:10px 0 0 0;
        border-radius: 5px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
    }
    .tsp-extension-loading {
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0% {
            background: rgba(230,255,230,.8);
        }
        50% {
            background: rgba(230,255,230,0);
        }
        100% {
            background: rgba(230,255,230,.8);
        }
    }
    `;

    const conteneur = document.createElement("div");
    conteneur.classList.add("tsp-extension-loading");
    conteneur.classList.add("tsp-extension");
    conteneur.innerHTML = `
<img src="${browser.runtime.getURL("icons/icon128.png")}" width="40" alt="Extension transparence santé" />
<div><b>Conventions, rémunérations et avantages reçus des entreprises de santé :</b><br/>
<div id="tsp-contenu">...Chargement des données de transparence.sante.gouv.fr</div>
</div>
`;
    parentChezDocto?.append(style);
    parentChezDocto?.append(conteneur);
    fetch(`https://www.transparence.sante.gouv.fr/api/records/1.0/search/?disjunctive.motif_lien_interet=true&disjunctive.profession_libelle=true&disjunctive.ville=true&disjunctive.dep_name=true&disjunctive.identite=true&disjunctive.reg_name=true&disjunctive.lien_interet=true&disjunctive.entreprise_nom_pays=true&disjunctive.beneficiaire_nom_pays=true&sort=-date&rows=200&dataset=declarations&q=lien_interet:%27avantage%27+OR+lien_interet:%27convention%27+OR+lien_interet:%27remuneration%27&q=(lien_interet:%27convention%27)+OR+(lien_interet:%27remuneration%27)+OR+(lien_interet:%27avantage%27)&q=beneficiaire_identifiant:%27${infosLegales.textContent}%27&lang=fr`)
        .then(response => response.json()).then(
        data => {
            const resume = data.records.reduce((acc, record) => {
                if (record.fields.montant) {
                    console.log(record.fields.date);
                    return {
                        total: acc.total + record.fields.montant,
                        dateDebut: (record.fields.date <= acc.dateDebut) ? record.fields.date : acc.dateDebut,
                        id_beneficiaire: record.fields.id_beneficiaire,
                    };
                }
                return acc;
            }, {total: 0, dateDebut: "2023-12-31"});
            document.getElementById("tsp-contenu").innerHTML = `
<strong style="font-size: 1.5em">${resume.total} €</strong> depuis le ${resume.dateDebut}<br />
<a target="_blank" href="https://www.transparence.sante.gouv.fr/pages/infosbeneficiaires/?refine.id_beneficiaire=${resume.id_beneficiaire}"> [source et détails]</a>
`;

            conteneur.replaceWith(conteneur)
            conteneur.classList.remove("tsp-extension-loading");
        }
    ).catch((e) => {
        conteneur.classList.remove("tsp-extension-loading");
        document.getElementById("tsp-contenu").replaceWith(document.createTextNode("Problème lors de la récupération des données de transparence.sante.gouv.fr"));
    });
}
