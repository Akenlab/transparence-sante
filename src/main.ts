const infosLegalesTitle = document.evaluate("//p[text()='Numéro RPPS']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
const infosLegales:ChildNode = infosLegalesTitle?.parentElement.lastChild;
const rrps=infosLegales?.textContent;
if(rrps) {
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
            const specialite = document.querySelector(".dl-profile-header-name-speciality");
            const conteneur = (document.createElement("div"));
            conteneur.setAttribute("style", "background: rgba(255,255,255,.8);padding: 5px;margin:10px 0 0 0;border-radius: 5px;display: inline-block;");
            const titre = document.createElement("b");
            titre.textContent = "Conventions, rémunérations et avantages reçus des entreprises de santé :"
            conteneur.append(titre);
            conteneur.append(document.createElement("br"));
            const montant = document.createElement("strong");
            montant.textContent = `${resume.total} €`;
            conteneur.append(montant);
            conteneur.append(` depuis le ${resume.dateDebut}`);
            const lienDetail = document.createElement("a");
            lienDetail.target = "_blank";
            lienDetail.text = " [ source et détails ]"
            lienDetail.href = `https://www.transparence.sante.gouv.fr/pages/infosbeneficiaires/?refine.id_beneficiaire=${resume.id_beneficiaire}`
            conteneur.append(
                lienDetail
            );
            const extension = document.createElement("div");
            extension.setAttribute("style", "font-size: 8px;color:#666;text-align: right;");
            extension.textContent = " Extension Transparence Santé";
            conteneur.append(extension);
            specialite.append(conteneur);
        }
    );
}
