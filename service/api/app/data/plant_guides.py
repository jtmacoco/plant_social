"""
Plant care guide seed data.

These guides will be embedded with CLIP and stored in Pinecone.
When a user uploads a plant image, we search these for relevant tips.
"""

PLANT_GUIDES = [
    # Overwatering / Yellow Leaves
    {
        "id": "guide_001",
        "title": "Overwatering Signs",
        "category": "watering",
        "text": "Yellow leaves combined with soggy soil is a classic sign of overwatering. Let the soil dry out between waterings. Remove the plant from standing water and ensure the pot has drainage holes. Trim away mushy or rotting roots.",
    },
    {
        "id": "guide_002",
        "title": "Underwatering Signs",
        "category": "watering",
        "text": "Dry, crispy, and brown leaf edges indicate underwatering. The soil may be pulling away from the sides of the pot. Water thoroughly until it drains from the bottom. Establish a consistent watering schedule.",
    },
    {
        "id": "guide_003",
        "title": "Proper Watering Technique",
        "category": "watering",
        "text": "Water plants in the morning so leaves dry before evening. Water at the soil level, not overhead, to prevent fungal diseases. Use room temperature water. Water deeply and less frequently rather than a little every day.",
    },
    # Sunlight
    {
        "id": "guide_004",
        "title": "Low Light Plants",
        "category": "light",
        "text": "Plants like pothos, snake plants, and ZZ plants thrive in low light. They can tolerate north-facing windows or rooms with minimal natural light. Avoid direct sunlight which can scorch their leaves.",
    },
    {
        "id": "guide_005",
        "title": "Bright Indirect Light Plants",
        "category": "light",
        "text": "Monstera, fiddle leaf fig, and calathea need bright indirect light. Place them near east or west-facing windows with a sheer curtain. Direct sun will burn their leaves, but too little light causes leggy growth.",
    },
    {
        "id": "guide_006",
        "title": "Full Sun Plants",
        "category": "light",
        "text": "Succulents, cacti, and herbs like basil need 6+ hours of direct sunlight. Place them on south-facing windowsills. Rotate regularly for even growth. Watch for sunburn on newly introduced plants.",
    },
    {
        "id": "guide_007",
        "title": "Sunburn on Leaves",
        "category": "light",
        "text": "White or bleached patches on leaves indicate sun damage. Move the plant to a shadier spot or add a sheer curtain. Gradually acclimate plants to brighter conditions over 1-2 weeks. Remove severely damaged leaves.",
    },
    # Soil & Repotting
    {
        "id": "guide_008",
        "title": "When to Repot",
        "category": "soil",
        "text": "Repot when roots grow out of drainage holes, the plant becomes top-heavy, water runs straight through, or growth stalls. Best time is spring. Go up only one pot size at a time. Use fresh potting mix.",
    },
    {
        "id": "guide_009",
        "title": "Choosing Soil Mix",
        "category": "soil",
        "text": "Tropical plants need well-draining mix with perlite and peat moss. Succulents need sandy, fast-draining soil. Orchids need bark-based mix. Adding perlite to any mix improves drainage and aeration.",
    },
    # Pests
    {
        "id": "guide_010",
        "title": "Spider Mites",
        "category": "pests",
        "text": "Fine webbing between leaves and tiny dots moving on undersides indicate spider mites. Isolate the plant. Spray with neem oil or insecticidal soap. Increase humidity as mites thrive in dry conditions. Repeat treatment weekly.",
    },
    {
        "id": "guide_011",
        "title": "Fungus Gnats",
        "category": "pests",
        "text": "Small flying insects around soil indicate fungus gnats. Let soil dry out more between waterings. Add a layer of sand on top of soil. Use yellow sticky traps. Water with hydrogen peroxide solution (1 part to 4 parts water).",
    },
    {
        "id": "guide_012",
        "title": "Mealybugs",
        "category": "pests",
        "text": "White cottony masses on stems and leaf joints are mealybugs. Dab with rubbing alcohol using a cotton swab. Spray with neem oil solution. Isolate affected plants. Check nearby plants for spread.",
    },
    # Specific Plant Types
    {
        "id": "guide_013",
        "title": "Succulent Care",
        "category": "plant_type",
        "text": "Succulents store water in their thick leaves and need infrequent watering. Water only when soil is completely dry. Use well-draining cactus soil. Provide bright direct light. They prefer low humidity and good airflow.",
    },
    {
        "id": "guide_014",
        "title": "Tropical Plant Care",
        "category": "plant_type",
        "text": "Tropical plants like monstera, philodendron, and calathea need high humidity (50-80%), warm temperatures, and indirect light. Mist regularly or use a humidifier. Keep away from cold drafts. Feed monthly in growing season.",
    },
    {
        "id": "guide_015",
        "title": "Herb Garden Care",
        "category": "plant_type",
        "text": "Herbs like basil, mint, and rosemary need 6+ hours of sunlight and well-draining soil. Harvest regularly to promote bushy growth. Don't let them flower if you want flavorful leaves. Most herbs prefer slightly dry soil between waterings.",
    },
    {
        "id": "guide_016",
        "title": "Flowering Plant Care",
        "category": "plant_type",
        "text": "Flowering plants like orchids, African violets, and peace lilies need specific light cycles to bloom. Use phosphorus-rich fertilizer during blooming season. Deadhead spent flowers to encourage new blooms. Maintain consistent temperature.",
    },
    # General Health
    {
        "id": "guide_017",
        "title": "Brown Leaf Tips",
        "category": "health",
        "text": "Brown leaf tips are usually caused by low humidity, inconsistent watering, or salt buildup from fertilizer. Increase humidity with a pebble tray or humidifier. Flush soil monthly with plain water. Trim brown tips with clean scissors.",
    },
    {
        "id": "guide_018",
        "title": "Leggy or Stretching Plants",
        "category": "health",
        "text": "Plants stretching toward light with long spaces between leaves are not getting enough light. Move to a brighter spot. Rotate the pot regularly. Prune leggy stems to encourage bushier growth. Consider grow lights in winter.",
    },
    {
        "id": "guide_019",
        "title": "Wilting Plants",
        "category": "health",
        "text": "Wilting can mean underwatering OR overwatering. Check the soil: if dry, water thoroughly. If wet and mushy, the roots may be rotting. Repot in fresh soil if root rot is present. Ensure proper drainage.",
    },
    {
        "id": "guide_020",
        "title": "Fertilizing Basics",
        "category": "nutrition",
        "text": "Feed plants monthly during spring and summer with balanced liquid fertilizer diluted to half strength. Stop fertilizing in fall and winter when growth slows. Over-fertilizing causes salt buildup and brown leaf edges. Always water before fertilizing.",
    },
    # Additional Watering Issues
    {
        "id": "guide_021",
        "title": "Root Rot Prevention",
        "category": "watering",
        "text": "Root rot occurs when soil stays too wet for too long. Always use pots with drainage holes. Choose well-draining soil mixes. Allow top 1-2 inches to dry between waterings. If root rot develops, trim away black mushy roots with sterile scissors and repot in fresh dry soil.",
    },
    {
        "id": "guide_022",
        "title": "Bottom Watering Technique",
        "category": "watering",
        "text": "Bottom watering prevents overwatering and encourages deep root growth. Place plant pot in a tray of water for 10-20 minutes until top soil feels moist. Drain excess water. This method is ideal for African violets, succulents, and plants prone to fungal issues.",
    },
    # Humidity
    {
        "id": "guide_023",
        "title": "Increasing Indoor Humidity",
        "category": "health",
        "text": "Many houseplants need 40-60% humidity. Group plants together to create a humid microclimate. Use pebble trays filled with water under pots. Run a humidifier near plants. Mist leaves in morning. Avoid placing plants near heating vents or AC units.",
    },
    {
        "id": "guide_024",
        "title": "Low Humidity Damage",
        "category": "health",
        "text": "Brown crispy leaf edges, leaf drop, and spider mites indicate low humidity. This is common in winter when heating systems dry indoor air. Increase humidity with humidifiers or grouping plants. Avoid misting flowering plants as it can cause bud drop.",
    },
    # Temperature
    {
        "id": "guide_025",
        "title": "Temperature Stress",
        "category": "health",
        "text": "Most houseplants prefer 65-75°F during day and 60-70°F at night. Sudden temperature changes cause leaf drop. Keep plants away from cold drafts, AC vents, and heating sources. Tropical plants suffer below 50°F. Move plants away from cold windows in winter.",
    },
    {
        "id": "guide_026",
        "title": "Cold Damage Recovery",
        "category": "health",
        "text": "Cold-damaged leaves turn black or translucent. Move plant to warmer location immediately. Don't remove damaged leaves right away - they still photosynthesize. Wait until spring to prune. Reduce watering as cold-damaged roots absorb less water.",
    },
    # Additional Pests
    {
        "id": "guide_027",
        "title": "Aphids Control",
        "category": "pests",
        "text": "Tiny green, black, or white insects clustering on new growth are aphids. They secrete sticky honeydew. Spray with strong water stream to dislodge. Apply insecticidal soap or neem oil every 5-7 days. Ladybugs are natural predators. Check for ants which farm aphids.",
    },
    {
        "id": "guide_028",
        "title": "Scale Insects",
        "category": "pests",
        "text": "Brown or white bumps on stems and leaf undersides are scale insects. They don't move and look like raised shells. Scrape off with fingernail or dull knife. Wipe stems with rubbing alcohol. Spray with horticultural oil. Monitor closely for several weeks.",
    },
    {
        "id": "guide_029",
        "title": "Thrips Identification",
        "category": "pests",
        "text": "Silver streaks on leaves, black specks of waste, and tiny fast-moving insects indicate thrips. They cause distorted new growth. Isolate plant immediately. Spray with spinosad or insecticidal soap. Use blue sticky traps. Repeat treatment every 3 days for 2 weeks.",
    },
    # Diseases
    {
        "id": "guide_030",
        "title": "Powdery Mildew Treatment",
        "category": "pests",
        "text": "White powdery coating on leaves is powdery mildew fungus. Improve air circulation around plant. Reduce humidity. Remove affected leaves. Spray with mixture of 1 tbsp baking soda and 1 tsp dish soap per gallon of water. Treat weekly until resolved.",
    },
    {
        "id": "guide_031",
        "title": "Bacterial Leaf Spot",
        "category": "pests",
        "text": "Water-soaked spots with yellow halos indicate bacterial infection. Remove affected leaves immediately. Avoid overhead watering. Improve air circulation. Water in morning so leaves dry quickly. Disinfect tools between cuts. Bacterial issues spread quickly in high humidity.",
    },
    {
        "id": "guide_032",
        "title": "Fungal Disease Prevention",
        "category": "pests",
        "text": "Prevent fungal diseases by watering at soil level, not on leaves. Ensure good air circulation - don't overcrowd plants. Remove dead leaves promptly. Avoid overwatering. Use sterile potting mix. Disinfect pots before reusing. Isolate sick plants immediately.",
    },
    # Specific Symptoms
    {
        "id": "guide_033",
        "title": "Yellowing Lower Leaves",
        "category": "health",
        "text": "A few yellow lower leaves is natural aging - remove them. Many yellow leaves indicate overwatering or nitrogen deficiency. If soil is soggy, reduce watering. If soil is dry, fertilize with balanced fertilizer. Yellow leaves with green veins suggest iron deficiency.",
    },
    {
        "id": "guide_034",
        "title": "Leaf Curling",
        "category": "health",
        "text": "Upward curling leaves indicate underwatering or heat stress. Downward curling suggests overwatering or cold damage. Inward curling with distorted growth indicates pest damage. Check soil moisture, temperature, and inspect for pests before adjusting care.",
    },
    {
        "id": "guide_035",
        "title": "Sudden Leaf Drop",
        "category": "health",
        "text": "Sudden leaf drop indicates shock from temperature change, drafts, overwatering, or being moved. Ficus trees are especially sensitive. Maintain consistent environment. Don't repot or fertilize until plant recovers. Some leaf drop is normal when adapting to new location.",
    },
    {
        "id": "guide_036",
        "title": "Drooping Leaves",
        "category": "health",
        "text": "Drooping can mean underwatering, overwatering, or root issues. Check soil moisture first. If dry, water thoroughly. If wet, check for root rot. Drooping at same time daily may indicate need for more water. Persistent drooping despite watering suggests root damage.",
    },
    # Seasonal Care
    {
        "id": "guide_037",
        "title": "Winter Plant Care",
        "category": "plant_type",
        "text": "In winter, reduce watering frequency as plants grow slower. Stop fertilizing from October to March. Move plants away from cold windows. Increase humidity to combat dry indoor air. Provide supplemental grow lights as daylight decreases. Avoid repotting.",
    },
    {
        "id": "guide_038",
        "title": "Spring Growth Transition",
        "category": "plant_type",
        "text": "As days lengthen in spring, resume regular fertilizing schedule. This is ideal time for repotting and propagation. Gradually increase watering as plants enter active growth. Move plants back to brighter locations. Prune dead or damaged growth.",
    },
    # Propagation
    {
        "id": "guide_039",
        "title": "Stem Cutting Propagation",
        "category": "plant_type",
        "text": "Take 4-6 inch cuttings just below a leaf node. Remove lower leaves. Place in water or moist perlite. Keep in bright indirect light. Change water weekly. Roots appear in 2-6 weeks. Transplant when roots are 2 inches long. Works for pothos, philodendron, monsteras.",
    },
    {
        "id": "guide_040",
        "title": "Leaf Propagation for Succulents",
        "category": "plant_type",
        "text": "Gently twist healthy leaves from succulent stem. Let callus over for 2-3 days. Place on dry cactus soil - don't bury. Mist lightly every few days. Roots appear first, then baby plant. Wait until mother leaf shrivels before watering normally.",
    },
    # Air and Water Quality
    {
        "id": "guide_041",
        "title": "Air Circulation Importance",
        "category": "health",
        "text": "Good air circulation prevents fungal diseases and pest infestations. Don't overcrowd plants. Use a small fan on low setting to keep air moving. Open windows when weather permits. Avoid stagnant air but protect from strong drafts. Proper airflow strengthens stems.",
    },
    {
        "id": "guide_042",
        "title": "Tap Water Issues",
        "category": "watering",
        "text": "Chlorine, fluoride, and salts in tap water cause brown tips in sensitive plants like dracaena and spider plants. Let tap water sit 24 hours before using to allow chlorine to evaporate. Use filtered, distilled, or rainwater for sensitive species. Flush soil monthly.",
    },
    # More Specific Plant Types
    {
        "id": "guide_043",
        "title": "Fern Care Requirements",
        "category": "plant_type",
        "text": "Ferns need consistently moist soil - never let dry out completely. Require high humidity (60-80%) and indirect light. Mist daily or use humidity tray. Keep away from heat sources. Feed monthly with diluted fertilizer. Brown crispy fronds indicate low humidity or underwatering.",
    },
    {
        "id": "guide_044",
        "title": "Cactus Care Guidelines",
        "category": "plant_type",
        "text": "Cacti need very infrequent watering - every 2-4 weeks in summer, monthly or less in winter. Require maximum light and warm temperatures. Use fast-draining cactus soil. Don't water if soil is still moist. Shriveling indicates underwatering. Soft spots indicate overwatering.",
    },
    {
        "id": "guide_045",
        "title": "Prayer Plant Care",
        "category": "plant_type",
        "text": "Prayer plants (Maranta, Calathea, Stromanthe) need high humidity, consistent moisture, and filtered light. Never let soil dry completely. Use distilled water as they're sensitive to chemicals. Leaves curl and brown in low humidity. Leaf patterns fade in too much light.",
    },
    # Fertilizer Specifics
    {
        "id": "guide_046",
        "title": "Nitrogen Deficiency Signs",
        "category": "nutrition",
        "text": "Overall yellow leaves, especially older lower leaves, indicate nitrogen deficiency. Plant growth slows noticeably. Apply balanced fertilizer (20-20-20) or fertilizer higher in nitrogen. Feed every 2 weeks until green color returns. Nitrogen promotes leaf growth.",
    },
    {
        "id": "guide_047",
        "title": "Fertilizer Burn Recovery",
        "category": "nutrition",
        "text": "Brown crispy leaf tips and edges, white crust on soil surface, or wilting indicate fertilizer burn from over-fertilizing. Flush soil thoroughly with plain water - run water through pot for several minutes. Remove affected leaves. Don't fertilize for 6-8 weeks. Resume at quarter strength.",
    },
    # Light Issues
    {
        "id": "guide_048",
        "title": "Variegated Plant Light Needs",
        "category": "light",
        "text": "Variegated plants (white or yellow patterns) need more light than solid green varieties because they have less chlorophyll. Insufficient light causes reversion to all-green leaves. Provide bright indirect light. Prune any all-green leaves that appear to maintain variegation.",
    },
    {
        "id": "guide_049",
        "title": "Grow Light Guidelines",
        "category": "light",
        "text": "Full-spectrum LED grow lights provide 6500K color temperature. Place 6-12 inches above foliage. Run 12-16 hours daily for most plants. Timer ensures consistency. Grow lights prevent leggy growth in low-light homes. Essential for windowless rooms and dark winter months.",
    },
    {
        "id": "guide_050",
        "title": "Light Acclimation Process",
        "category": "light",
        "text": "Always acclimate plants gradually when moving to brighter location. Start with 1-2 hours of new light conditions, increasing daily over 1-2 weeks. Sudden bright light causes sunburn. New growth adapts to light levels, so change light gradually. Monitor for bleaching or scorching.",
    },
]
