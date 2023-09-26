import { actions as searchActions } from "./SearchContacts";
import { actions as contactDetailsActions } from "./ContactDetails";

export const updateSearchPhrase = newPhrase =>
  (dispatch, getState, { httpApi }) => {
    dispatch(
      searchActions.updateSearchPhraseStart({ newPhrase }),
    );
    httpApi.getFirst5MatchingContacts({ namePart: newPhrase })
      .then(({ data }) => {
        const matchingContacts = data.map(contact => ({
          id: contact.id,
          value: contact.name,
        }));

        dispatch(
          searchActions.updateSearchPhraseSuccess({ matchingContacts: matchingContacts }),
        );
      })
      .catch(() => {
        dispatch(
          searchActions.updateSearchPhraseFailure()
        );
      });
  };

export const selectMatchingContact = selectedMatchingContact =>
  (dispatch, getState, { httpApi, dataCache }) => {

    let contactDetails = dataCache.load({
      key: selectedMatchingContact.id,
    });
    console.log('contactDteails from Cache: ', contactDetails)
    if( selectedMatchingContact.id === contactDetails?.id) {
      dispatch(
        searchActions.selectMatchingContact({ selectedMatchingContact }),
      );
      dispatch(
        contactDetailsActions.fetchContactDetailsSuccess({contactDetails}),
      );
      return;
    }

    const getContactDetails = ({ id }) => {
      return httpApi
          .getContact({ contactId: selectedMatchingContact.id })
          .then(({ data }) => ({
            id: data.id,
            name: data.name,
            phone: data.phone,
            addressLines: data.addressLines,
          }));
    };

    dispatch(
      searchActions.selectMatchingContact({ selectedMatchingContact }),
    );

    dispatch(
      contactDetailsActions.fetchContactDetailsStart(),
    );

    getContactDetails({ id: selectedMatchingContact.id })
      .then((contactDetails) => {
        dataCache.store({
          key: contactDetails.id,
          value: contactDetails
        });
        dispatch(
          contactDetailsActions.fetchContactDetailsSuccess({contactDetails}),
        );
      })
      .catch(() => {
        dispatch(
          contactDetailsActions.fetchContactDetailsFailure(),
        );
      });
  };
