Country code label --> check it is in database --> main one.
    - if it is in th edatabase, then it is more likely to be frontend.
    - if not, it is more likely to be a backend issue.
- then I need to understand why it is not shwoign the check-your-answers page.
- understand ht eproblem before creating a solution.
- It is fine this failed, I need to adjust my understanding so I can fix this issue.
- but first research.


-[ RECORD 1 ]-----------------------+-------------------------------------
id                                  | b5217702-01a0-4890-a396-38f3810ac416
user_id                             | c15649e4-f8b5-4fae-b874-bd5dc305177d
individual_id                       | c15649e4-f8b5-4fae-b874-bd5dc305177d
organisation_id                     | 
cbp_id                              | 
cbp_response                        | 
created_date                        | 2023-09-25 12:19:36.113558
registration                        | GABCD
craft_type                          | Gulfstream
craft_base                          | LGW
departure_date                      | 2023-10-12
departure_time                      | 18:30:00
departure_port                      | LAX
departure_long                      | 
departure_lat                       | 
arrival_date                        | 2023-10-13
arrival_time                        | 23:30:00
arrival_port                        | LGW
arrival_long                        | 
arrival_lat                         | 
responsible_person_first_name       | 
responsible_person_last_name        | 
responsible_person_telephone_number | 
responsible_person_address_line1    | 
responsible_person_address_line2    | 
responsible_person_town             | 
responsible_person_county           | 
responsible_person_postcode         | 
prohibited_goods                    | 
visit_reason                        | Maintenance
free_circulation                    | 
status_id                           | 4ea9b603-66a5-4aa2-8cd4-5270bf927c6c
goods_declaration                   | 
baggage                             | 
baggage_declaration                 | 
fixed_based_operator                | 
fixed_based_operator_answer         | 
intention_value                     | No
passenger_travelling_reason         | sadf
supporting_information              | asdf
responsible_person_email            | 
responsible_person_country_label    | 
continental_shelf                   | 
continental_shelf_declaration       | 


it is there but, blank --> understand waht is being sent and if that is the issue, or if it is some different.
- first of is post the value that is got from the application and then the value that it gotten from the data-access-api.
- doubel the chekc the frontend as well, to ensure that teh countryList is not autoamtically null for research.
    - this will provide additional evidence fo either backend or frontend.
    - sicne the property si there, there are many ways it could not be avaialble, I need to search them.
    - It is null on the frontend --> my guess is taht the because it is null on the frotnend end or udenifned --> the autocompelte is the problem --> therefore, I should ammend it back to the way it was as well as use the function istead.
    - I hyptoehsis this as it if there were avaiable, then the other coutnryList should be available as wel.
        - howtierh it if it is not, then it will not do this.
        - I don't knwo the mechanism for how, but i should not intro duce new bug sinto the system.
        - I can deep diver if I mvoe to the other design later.
        - geerate country lsit was turn backend, but still erororing.
        - I think a force-recreate should do it --> not understand this error, but isntead turning back the clocks. Re look at git graph to under it better.
        - Heck, just git reset soft.
- nothign is getting saved to investigate. maybe the country code was incorrect too, jsut wrong field.
- back to control, research the logs, understand the issues, don't try to resolve the issue, understand the problem deeply.
    - read teh control, understand it.
    - Nothing trips the eye currently.
    - look at api logs, see if thatere is a 400/500, understand if ther ei ssomehting obviosuly failing.
    PATCH /v0.2.0/gar/b5217702-01a0-4890-a396-38f3810ac416
    - try the responsible gar people again, to see if the 400 come sup, or it is a fluke.
    - another 400 patch --> try and recreate it done, get logs of the errors and co.
    // {'responsibleCountryLabel': ['Not a valid string.']}
    I hypothesis that it is from element returning a { code: str; label: string; } --> returnign this rather than a valid string, else it would be undefiend --> I can cast that a string.
    either way, it return s astring rather than not a string.
    - if i am right, the the 400 will stop, since a valid stirng is returned and the database will ahve the new value.
    - if I am wrong, then it will not.
    - it seems to work the app as well --> udnerstand garfile so I can catch any bug before landing.