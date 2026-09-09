# -*- coding: utf-8 -*-
"""A research category and a description for every compound in the books.

The description says what the molecule is, where it came from, and what
published preclinical work has examined. It never says what it does for a
person. Review before any of this reaches a customer-facing surface.
"""
CATS={'Recovery':['bpc-157','tb-500','wolverine','kpv','ara-290'],
 'Skin & hair':['ghk-cu','ghk-cu-spray','glow','klow'],
 'Cognitive':['semax','selank','semax-spray','selank-spray','adamax','dsip'],
 'Cellular & longevity':['nad','nad-spray','mots-c','ss-31','5-amino-1mq','glutathione','thymosin-alpha-1'],
 'Growth & performance':['cjc-1295','ipamorelin','sermorelin','tesamorelin','tesa-ipa','igf1-lr3'],
 'Metabolic':['sko-3-rt','sko-trz','cagrilintide','aod-9604'],
 'Pigment':['mt-1','mt-2','mt-2-spray'],
 'Libido':['pt-141','kisspeptin'],
 'Supplies':['bac-water']}
SKO_CAT={s:c for c,ss in CATS.items() for s in ss}
MER_CAT={'metabolic-research':'Metabolic research','performance-research':'Performance research',
 'dermal-research':'Dermal research','peptide-research':'Peptide research',
 'cellular-research':'Cellular research','supplies':'Supplies'}

D={
 'bpc-157':'A fifteen-residue fragment of a protein found in human gastric juice, described in Zagreb in the 1990s. It survives stomach acid, which is what drew attention to it in the first place. Preclinical work has examined tendon, muscle and gut tissue repair.',
 'tb-500':'A synthetic fragment of thymosin beta-4, the actin-binding protein present in almost every human cell. The fragment carries the short sequence associated with cell migration and nothing else. Studied in animal models of tissue repair.',
 'wolverine':'BPC-157 and TB-500 in one vial: the two repair peptides of the literature, run together rather than one after the other. Each has its own body of preclinical work. The blend exists so they can be studied as a pair.',
 'kpv':'The last three residues of alpha-MSH, the hormone that also drives pigmentation. Cut down to a tripeptide it loses the colour signal and keeps an inflammatory one. Studied in gut and skin models.',
 'ara-290':'An eleven-residue peptide built from a hidden face of erythropoietin, the hormone behind red blood cell production. It was designed to reach the innate repair receptor without touching the blood. Studied in neuropathy models.',
 'ghk-cu':'A copper-binding tripeptide isolated from human plasma in 1973, where its concentration falls steadily with age. The copper is held inside the peptide itself, which is why the powder is blue. Studied in skin remodelling and wound models.',
 'glow':'GHK-Cu, BPC-157 and TB-500 in one vial: the copper tripeptide alongside the two repair peptides. Three separate literatures, combined so they can be studied as a set rather than singly.',
 'klow':'KPV with GHK-Cu, BPC-157 and TB-500, the widest of the house blends. Four peptides, four separate bodies of preclinical work, put in one vial to be studied together.',
 'semax':'A synthetic analogue of ACTH fragment four to ten, developed in Moscow in the 1980s and still listed in Russia today. The fragment carries none of the parent hormone signal. Studied in cognition and stroke models.',
 'selank':'A synthetic analogue of tuftsin, a four-residue immune peptide, extended at one end for stability. Developed at the same Moscow institute as Semax. Studied for anxiolytic signalling in rodent models.',
 'semax-selank':'Semax with Selank: the two peptides developed at the same Moscow institute, in one vial. Their published work runs in parallel, so the blend exists to study them together.',
 'adamax':'A peptide of the Semax family built on the same ACTH fragment skeleton, with the terminal chemistry changed for stability. Studied alongside its parent in cognition models.',
 'dsip':'Delta sleep-inducing peptide, isolated from rabbit brain in 1977 by moving blood from sleeping animals into waking ones. Nine residues. Studied in sleep architecture research.',
 'nad':'Nicotinamide adenine dinucleotide, a coenzyme present in every living cell and among the oldest molecules in biology. Its whole job is carrying electrons between reactions. Studied in mitochondrial and ageing research.',
 'mots-c':'A sixteen-residue peptide encoded in mitochondrial DNA rather than the nucleus, described in 2015. Mitochondria keep their own genome, a remnant of the bacterium they once were. Studied in metabolic and exercise research.',
 'ss-31':'A four-residue peptide that concentrates in the inner mitochondrial membrane, where it binds cardiolipin. Also known as elamipretide. Studied for mitochondrial function.',
 '5-amino-1mq':'Not a peptide but a small molecule: an inhibitor of nicotinamide N-methyltransferase, an enzyme that draws on the same pool NAD does. Studied in cellular energy research.',
 'glutathione':'A tripeptide the body makes in every cell, and the most abundant antioxidant in human tissue. Its reactive sulphur atom does all of the work. Studied in oxidative stress research.',
 'thymosin-alpha-1':'A twenty-eight-residue peptide from the thymus, the gland that trains immune cells and then shrinks after childhood. Isolated in 1972. Studied in immune signalling research.',
 'cjc-1295':'An analogue of growth hormone releasing hormone, altered at four positions to resist the enzyme that would otherwise clear it in minutes. Studied for pituitary signalling.',
 'cjc-ipa':'CJC-1295 without DAC alongside Ipamorelin: a releasing hormone analogue paired with a ghrelin receptor agonist. Two different routes to the same pituitary cell, in one vial.',
 'ipamorelin':'A five-residue agonist at the ghrelin receptor, selective enough that it was among the first of its kind to leave the appetite and cortisol signals of earlier compounds alone. Studied for growth hormone release.',
 'sermorelin':'The first twenty-nine residues of growth hormone releasing hormone: the shortest fragment that keeps the full activity of the parent. Everything past residue twenty-nine is structural.',
 'tesamorelin':'A growth hormone releasing hormone analogue with a fatty acid fixed to one end, added to slow its breakdown. Studied in growth hormone axis research.',
 'tesa-ipa':'Tesamorelin with Ipamorelin: a stabilised releasing hormone analogue paired with a ghrelin receptor agonist, studied as a pair rather than separately.',
 'igf1-lr3':'Insulin-like growth factor 1 with arginine at position three and thirteen extra residues at the front, changes that stop it binding its carrier proteins. Studied in cell culture for its longer half-life.',
 'sko-3-rt':'A thirty-nine-residue engineered peptide, the longest chain in the catalogue. Its coordinates have not been published, so the structure shown here is built from its sequence. Studied in receptor pharmacology.',
 'sko-trz':'A thirty-nine-residue engineered peptide carrying a long fatty acid chain that binds albumin in the blood and slows clearance. Studied in receptor pharmacology.',
 'cagrilintide':'A long-acting analogue of amylin, the pancreatic hormone secreted alongside insulin. It is modified to resist aggregation, which the natural hormone does readily. Studied in receptor pharmacology.',
 'aod-9604':'Residues 176 to 191 of human growth hormone: the tail of the molecule, cut away from the rest of it. Studied in cell and animal models of lipid handling.',
 'aod-xa':'AOD-9604 in a blend: the growth hormone tail studied alongside a second research compound rather than on its own.',
 'slu-pp-332':'A small molecule agonist of the estrogen-related receptors, developed at Saint Louis University. Studied as an exercise mimetic in rodent models.',
 'mt-1':'A synthetic analogue of alpha-MSH, the hormone that signals pigment cells. Thirteen residues, stabilised against the enzymes that clear the natural hormone within minutes.',
 'mt-2':'A cyclic analogue of alpha-MSH, cut to seven residues and closed into a ring, which makes it far more stable than the linear form. Studied at melanocortin receptors.',
 'pt-141':'A melanocortin receptor agonist derived from the melanotan series, altered so that it acts centrally rather than on the pigment cells. Studied in central signalling research.',
 'kisspeptin':'A hypothalamic peptide named for the town it was found in, Hershey, and the chocolate made there. It signals through KISS1R at the top of the reproductive axis.',
 'bac-water':'Sterile water with 0.9% benzyl alcohol, which is what allows a vial to be entered more than once. The diluent for reconstitution, not a research compound.',
 'kubix':'A Meridian house blend. Composition to be confirmed before this page is published.',
}
SKO_KEY={'ghk-cu-spray':'ghk-cu','nad-spray':'nad','semax-spray':'semax','selank-spray':'selank','mt-2-spray':'mt-2'}
MER_KEY={'mrdn-3-rt':'sko-3-rt','mrdn-trz':'sko-trz','mrdn-nad':'nad','bacteriostatic-water':'bac-water',
 'wolverine-blend':'wolverine','semax-selank-blend':'semax-selank','aod-xa-blend':'aod-xa',
 'tesa-ipa-blend':'tesa-ipa','cjc-1295-no-dac-ipamorelin':'cjc-ipa'}

def sko(slug): return SKO_CAT.get(slug,'Research'), D.get(SKO_KEY.get(slug,slug),'')
def mer(slug,category): return MER_CAT.get(category,'Research'), D.get(MER_KEY.get(slug,slug),'')
