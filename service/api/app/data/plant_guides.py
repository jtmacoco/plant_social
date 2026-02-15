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
]
