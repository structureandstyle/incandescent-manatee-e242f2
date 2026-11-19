/**
 * Every word on /design-your-own/ (19 Nov 2026), written against
 * SS_COPY_TONE_PROTOCOL_v1.4 by the copy agent. Facts come only from the cost
 * guide (service-copy.ts) and the questionnaire answers already on the site.
 * Whoever builds the page does not rewrite these.
 */
export const COPY = {
  meta: {
    title: "Design your own fitted wardrobe or alcove units in 3D",
    description: "Design your own fitted wardrobe or alcove units in 3D, see a guide starting price as you go, then send the design with your request for a quote.",
  },
  hero: {
    kicker: "Design your own",
    h1: "Design your own fitted wardrobe or alcove units",
    lede: "Draw it in 3D, type your own sizes and watch the guide starting price as you go. Then send the design with your quote request.",
    start: "Start designing",
    whatsapp: "Or send a photo on WhatsApp instead",
  },
  units: {
    heading: "What are you designing?",
    wardrobe: "Fitted wardrobe",
    wardrobeHint: "A run of doors across a wall or part of one",
    alcove: "Alcove units",
    alcoveHint: "A pair either side of a chimney breast",
  },
  steps: {
    size: {
      title: "Size",
      help: "Rough sizes are enough here. Every job is measured before anything is made.",
    },
    walls: {
      title: "How it meets the walls",
      help: "Say which ends sit against a wall and which stay open.",
    },
    finish: {
      title: "Finish",
      help: "Four finishes. The one you pick moves the guide price.",
    },
    colour: {
      title: "Example colours",
      help: "These are example colours for the picture only, not a range. Veneer is shown in example stains.",
    },
    // 19 Nov 2026: three more door styles, two more handles and a handle
    // finish step (a founder: "Add more styles"). These lines, and the new
    // option labels in model.mjs, are a copy agent's, against protocol v1.4.
    doors: {
      title: "Door style",
      help: "Shaker doors have a framed panel, and slim Shaker a narrower frame. Tongue and groove has vertical grooves across a flat door, fluted has rounded vertical reeds, and flat is plain.",
    },
    handles: {
      title: "Handles",
      help: "",
    },
    handleFinish: {
      title: "Handle finish",
      help: "The metal finish of the handles, for the picture.",
    },
    // 19 Nov 2026, a founder's review comments on the preview; a copy agent's, against protocol v1.4.
    insideFinish: {
      title: "Inside finish",
      help: "Chosen separately from the outside, and it moves the guide price.",
    },
    // 19 Nov 2026: every part now moves the price (a founder). These three
    // help lines are a copy agent's, against protocol v1.4, like the rest.
    inside: {
      title: "Inside",
      help: "Choose what goes in each section of the run. Each drawer adds its guide price, per drawer.",
      section: "Section",
    },
    extras: {
      title: "Extras",
      help: "Each extra adds its own guide price to the figure, shown line by line under it.",
    },
    alcoveSize: {
      title: "Alcove sizes",
      help: "Rough sizes are enough. Each alcove is measured at the survey.",
    },
    alcoveUnit: {
      title: "Base cupboard and shelves",
      help: "Each alcove has a base cupboard with two doors and open shelves above. Every shelf adds its own guide price to the figure.",
    },
  },
  fields: {
    width: "Width",
    height: "Height",
    depth: "Depth",
    unitMm: "mm",
    alcovePair: "A pair of alcoves",
    alcoveOne: "One alcove",
    leftWidth: "Left alcove width",
    rightWidth: "Right alcove width",
    oneWidth: "Alcove width",
    alcoveDepth: "Alcove depth",
    breast: "Chimney breast width",
    breastHelp: "For the picture only. It does not change the price.",
    ceiling: "Ceiling height",
    baseHeight: "Base cupboard height",
    shelves: "Open shelves above",
    outOfRange: "We can draw {min} to {max}mm here. Message us about other sizes.",
  },
  view: {
    // A founder's own words (his comment on the preview, 19 Nov 2026), in place of
    // the copy agent's "Show inside" and "Put doors back".
    doorsOpen: "Open doors",
    doorsClosed: "Closed doors",
    front: "Front",
    angle: "Angle",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    person: "Show a person for scale",
    threeD: "3D",
    drawing: "Drawing",
    loading: "Loading the 3D picture",
    unavailable: "3D will not run on this device. The drawing shows the same design.",
    // 19 Nov 2026: a spot can now be zoomed on (a founder's review); a copy agent's words.
    drag: "Drag to turn the picture. Double-click, or double-tap on a phone, to zoom in on a spot.",
    // While a computer works out the picture's lighting (scene.mjs, photo.mjs); a copy agent's words.
    refining: "Refining the lighting in the picture: {n}%",
    note: "This picture is an illustration to help you decide. It is not a drawing to make from.",
  },
  // 19 Nov 2026: the figure is worked out part by part from his price list (a
  // founder), so every size has one; "parts" and "breakdown" are a copy agent's.
  price: {
    label: "Guide price",
    from: "from",
    parts: "This guide price is worked out from what your design needs: boards, edging, fittings and handles, finishing, fitting time and delivery.",
    breakdown: "What makes up this figure",
    guide: "A guide starting price, not a fixed quotation. A detailed, itemised quotation follows the measured survey.",
    quoted: "Priced in your quotation",
  },
  actions: {
    add: "Add to my project",
    added: "Added to your project",
    update: "Update design",
    send: "Send this design",
    copyLink: "Copy link to this design",
    copied: "Link copied",
    // 19 Nov 2026, after adding a design (a founder's review); a copy agent's words.
    addedPrompt: "Do you want to design another unit?",
    another: "Design another",
    keep: "Keep this design",
  },
  project: {
    heading: "My project",
    empty: "Nothing here yet. Add a design and it will appear with its guide price.",
    edit: "Edit",
    remove: "Remove",
    othersHeading: "Other work to quote at the same visit",
    othersHelp: "Tick anything else you want looked at. It is sent with your enquiry, with no figure.",
    total: "Guide starting prices shown, added up",
    totalNote: "Anything with no figure is priced in the quotation, so the total is a guide, not a quotation.",
    send: "Send my project",
    sendHelp: "The enquiry form opens with your designs already written into it. Add your details and any photos, then send it.",
  },
  limits: {
    heading: "What this page cannot draw",
    body: "Sloping ceilings, loft rooms, sliding doors and curved or unusual shapes cannot be drawn here. Send a photo and a few words on WhatsApp or through the enquiry form instead.",
    cta: "Send a photo instead",
  },
  how: {
    heading: "How it works",
    steps: [
      {
        title: "Design it here",
        body: "Type your sizes, pick a finish and what goes inside, and watch the guide starting price. Rough measurements are enough.",
      },
      {
        title: "We visit and measure",
        body: "We cover north London. Every job is measured before anything is made: the first visit usually takes 45 to 60 minutes and a survey about an hour.",
      },
      {
        title: "Quotation, then drawings",
        body: "A fixed, itemised quotation follows the survey, with no separate design fee. Drawings start once it is accepted and the deposit paid, with up to two rounds of revisions included.",
      },
    ],
  },
  faq: {
    heading: "Common questions",
    items: [
      {
        q: "Is the price shown what I will pay?",
        a: "It is a guide starting price, worked out from the parts, finishing and fitting time your design needs, not a fixed quotation. The final figure depends on exact dimensions, internal layout, materials and finish, design details, access and site conditions. A detailed, itemised quotation follows the measured survey.",
      },
      {
        q: "Do I need exact measurements?",
        a: "Rough sizes are enough. Every job is measured before anything is made, and the first visit usually takes 45 to 60 minutes. A measured survey takes about an hour.",
      },
      {
        q: "What if my room is an awkward shape?",
        a: "Sloping ceilings, loft rooms, sliding doors and curved or unusual shapes cannot be drawn on this page. Send a photo on WhatsApp or through the enquiry form and we will look at it with you.",
      },
      {
        q: "What happens after I send my design?",
        a: "The enquiry form opens with your design written into it. Add your details and any photos, then send it. We arrange a visit to measure, and a detailed, itemised quotation follows the survey. The picture is an illustration to help you decide, not a drawing to make from.",
      },
    ],
  },
  fallback: {
    noscript: "This page needs scripts to run. Without them, use the Get a quote form or send a photo on WhatsApp, and we will take it from there.",
  },
} as const;
