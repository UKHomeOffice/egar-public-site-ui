# Customs Form Refactor Notes

Moved each group of questions into separate include files.
Converted HTML to macros, where possible.
Added some Nunjucks filters to make retrieving error messages less of a pain.

Some hints were non-standard; I've tried to keep this as close to the current version, but we may need to make some changes.
For e.g. placholder text not recommended; hints to be used.
Radio hints are expected to be visible alongside the answer, rather than becoming visible on selection.

I have changed the javascript a bit. Old version used the 'onerror' event of an <img> tag with no src attribute.
Have moved to a DOMReady event, but could so some more here.

One thing I noticed was that the naming of form elements was inconsistent, which was very confusing.

This is a note of how I think it is set up:

## Is it the intention of anyone on the aircraft to make a customs declaration upon arrival into the United Kingdom?

- Radio name: `intentionValue`

## Does anyone on the aircraft have goods in excess of their personal allowance?

- Radio name: `prohibitedGoods`
- Textarea name: `goodsDeclaration`

## Are there any prohibited or restricted goods on board?

- Radio name: `baggage`
- Textarea name: `baggageDeclaration`

## Are the goods you intend to declare eligible for the UK Continental Shelf declaration by conduct process?

- Radio name: `continentalShelf`
- Textarea name: `continentalShelfDeclaration`

## Reason for Passengers Travelling to the United Kingdom?

- Radio name: `passengerTravellingReason`

## Reason for visit?

- Radio name: `visitReason`

## Please add any further information about your arrival, if relevant for Border Force consideration

- Textarea name: `supportingInformation`
