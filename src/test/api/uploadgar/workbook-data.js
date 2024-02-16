/**
 * Convenience file for returning bare bones representations of Excel spreadsheets as read and used
 * by the XLSX library. Can be imported and the functions called to return them.
 */
module.exports = {
  getInvalidWorkbook: () => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {
        C1: { v: '     GENERAL AVIATION REPORT (GAR) -  January 2015' },
        B3: { v: 'BFS' }, // Arrival Port
        D3: { v: '2022-05-31' },
        F3: { w: 'Arrival Time' },
        B4: { v: 'LGW' }, // Departure Port
        D4: { v: '2022-05-30' },
        F4: { w: 'Departure Time' },
        B5: { w: 'Registration' },
        D5: { w: 'Craft Type' },
        H5: { v: 'Craft Base' },
        L3: { v: 'Free Circulation' },
        B6: { v: 'Visit Reason' },
        // Crew
        A9: { v: 'TD_TYPE Document Type' },
        B9: { v: 'Document Type Other' },
        C9: { v: 'Issuing State' },
        D9: { v: 'DocumentNumber' },
        E9: { v: 'Kirk' },
        F9: { v: 'James' },
        G9: { v: 'Gender' },
        H9: { v: '1965-10-13' },
        I9: { v: 'Place of Birth' },
        J9: { v: 'Nationality' },
        K9: { v: '2033-02-28' },
        A17: { v: 'TOTAL CREW' },
        // Passengers
        A18: { v: 'PASSENGERS' },
        A20: { v: 'TD_TYPE Document Type' },
        B20: { v: 'Document Type Other' },
        C20: { v: 'Issuing State' },
        D20: { v: 'DocumentNumber' },
        E20: { v: 'Chekov' },
        F20: { v: 'Pavel' },
        G20: { v: 'Gender' },
        H20: { v: '1965-10-13' },
        I20: { v: 'Place of Birth' },
        J20: { v: 'Nationality' },
        K20: { v: '2023-06-01' },
        A40: { v: 'TOTAL PASSENGERS' },
      },
    },
  }),
  getValidWorkbook: () => ({
    SheetNames: ['Valid1'],
    Sheets: {
      Valid1: {
        C1: { v: '     GENERAL AVIATION REPORT (GAR) -  January 2015' },
        B3: { v: 'BFS' }, // Arrival Port
        D3: { v: '2022-05-31' },
        F3: { w: 'Arrival Time' },
        B4: { v: 'LGW' }, // Departure Port
        D4: { v: '2022-05-30' },
        F4: { w: 'Departure Time' },
        B5: { w: 'Registration' },
        D5: { w: 'Craft Type' },
        H5: { v: 'Craft Base' },
        L3: { v: 'Free Circulation' },
        B6: { v: 'Visit Reason' },
        // Crew
        A9: { v: 'Passport' },
        B9: { v: '' },
        C9: { v: 'USA' },
        D9: { v: 'DocumentNumber' },
        E9: { v: 'Kirk' },
        F9: { v: 'James' },
        G9: { v: 'Male' },
        H9: { v: '1965-10-13' },
        I9: { v: 'Place of Birth' },
        J9: { v: 'USA' },
        K9: { v: '2033-02-28' },
        A17: { v: 'TOTAL CREW' },
        // Passengers
        A18: { v: 'PASSENGERS' },
        A20: { v: 'Passport' },
        B20: { v: '' },
        C20: { v: 'USA' },
        D20: { v: 'DocumentNumber' },
        E20: { v: 'Chekov' },
        F20: { v: 'Pavel' },
        G20: { v: 'Male' },
        H20: { v: '1975-10-31' },
        I20: { v: 'Place of Birth' },
        J20: { v: 'RUS' },
        K20: { v: '2023-06-01' },
        A40: { v: 'TOTAL PASSENGERS' },
      },
    },
  }),
};
