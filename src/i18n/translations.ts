// src/i18n/translations.ts
export const translations = {
  en: {
    home: {
      noProject: 'No project assigned. Please contact an administrator.',
    },
    knowledge: {
      title: 'Questions and Answers',
      saveWarning:
        'Please ensure to save your changes by clicking the "Save Questions" button below.',
      addQuestion: 'Add Question',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      placeholders: {
        question: 'Question',
        answer: 'Answer',
      },
      toast: {
        success: {
          title: 'Success',
          description: 'Changes saved and synced with Voiceflow',
        },
        warning: {
          title: 'Warning',
          description: 'Saved to database but failed to sync with Voiceflow',
        },
        error: {
          title: 'Error',
          description: 'Failed to save changes',
        },
      },
    },
    transcripts: {
      viewer: {
        time: 'Time',
        message: 'Message',
      },
      selectTranscript: 'Select a transcript to view',
      list: {
        search: 'Search transcripts...',
        pickDateRange: 'Pick a date range',
        columns: 'Columns',
        noResults: 'No results found.',
        loading: 'Loading...',
        columnNames: {
          number: 'Transcript #',
          topic: 'Topic',
          messages: 'Messages',
          language: 'Language',
          duration: 'Duration',
          firstResponse: 'First Response',
          lastResponse: 'Last Response',
          bookmarked: 'Bookmarked',
          createdAt: 'Created At',
        },
      },
    },
    nav: {
      transcripts: 'Transcripts',
      analytics: 'Analytics',
      knowledge: 'Knowledge',
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      notFound: 'Not found',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
    },
    analytics: {
      dailyUsers: 'Daily Users',
      monthlyUsers: 'Monthly Users',
      languageDistribution: 'Language Distribution',
      messageCount: 'Average Message Count',
      sessionCount: 'Session Count',
      averageMessages: 'Average Messages',
      totalConversations: 'Total Conversations',
      count: 'Count',
      descriptions: {
        dailyUsers: 'Showing session counts for the past 7 days',
        monthlyUsers: 'Showing session counts for the past 12 months',
        languageDistribution: 'Distribution of conversations by language',
        messageCount:
          'Average number of messages per conversation over the last 30 days',
        topLanguagesShown: 'Top {count} shown',
      },
    },
    languages: {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      nl: 'Dutch',
      ru: 'Russian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
      ar: 'Arabic',
      hi: 'Hindi',
      tr: 'Turkish',
      pl: 'Polish',
      vi: 'Vietnamese',
      th: 'Thai',
      sv: 'Swedish',
      da: 'Danish',
      fi: 'Finnish',
      no: 'Norwegian',
      cs: 'Czech',
      el: 'Greek',
      he: 'Hebrew',
      ro: 'Romanian',
      hu: 'Hungarian',
      uk: 'Ukrainian',
      id: 'Indonesian',
      ms: 'Malay',
      fil: 'Filipino',
      bn: 'Bengali',
      fa: 'Persian',
      so: 'Somali',
      mul: 'Multiple languages',
    },
  },
  de: {
    home: {
      noProject:
        'Kein Projekt zugewiesen. Bitte kontaktieren Sie einen Administrator.',
    },
    knowledge: {
      title: 'Fragen und Antworten',
      saveWarning:
        'Bitte stellen Sie sicher, dass Sie Ihre Änderungen speichern, indem Sie unten auf den Knopf "Save Questions" klicken.',
      addQuestion: 'Frage hinzufügen',
      saveChanges: 'Änderungen speichern',
      saving: 'Wird gespeichert...',
      placeholders: {
        question: 'Frage',
        answer: 'Antwort',
      },
      toast: {
        success: {
          title: 'Erfolg',
          description:
            'Änderungen gespeichert und mit Voiceflow synchronisiert',
        },
        warning: {
          title: 'Warnung',
          description:
            'In Datenbank gespeichert, aber Synchronisierung mit Voiceflow fehlgeschlagen',
        },
        error: {
          title: 'Fehler',
          description: 'Fehler beim Speichern der Änderungen',
        },
      },
    },
    transcripts: {
      viewer: {
        time: 'Zeit',
        message: 'Nachricht',
      },
      selectTranscript: 'Wählen Sie ein Transkript zum Anzeigen',
      list: {
        search: 'Transkripte durchsuchen...',
        pickDateRange: 'Datumsbereich auswählen',
        columns: 'Spalten',
        noResults: 'Keine Ergebnisse gefunden.',
        loading: 'Wird geladen...',
        columnNames: {
          number: 'Transkript #',
          topic: 'Thema',
          messages: 'Nachrichten',
          language: 'Sprache',
          duration: 'Dauer',
          firstResponse: 'Erste Antwort',
          lastResponse: 'Letzte Antwort',
          bookmarked: 'Markiert',
          createdAt: 'Erstellt am',
        },
      },
    },
    nav: {
      transcripts: 'Transkripte',
      analytics: 'Analysen',
      knowledge: 'Wissensbasis',
    },
    common: {
      loading: 'Wird geladen...',
      error: 'Ein Fehler ist aufgetreten',
      notFound: 'Nicht gefunden',
    },
    auth: {
      signIn: 'Anmelden',
      signUp: 'Registrieren',
      signOut: 'Abmelden',
    },
    analytics: {
      dailyUsers: 'Tägliche Nutzer',
      monthlyUsers: 'Monatliche Nutzer',
      languageDistribution: 'Sprachverteilung',
      messageCount: 'Durchschnittliche Nachrichtenanzahl',
      sessionCount: 'Sitzungsanzahl',
      averageMessages: 'Durchschnittliche Nachrichten',
      totalConversations: 'Gesamtgespräche',
      count: 'Anzahl',
      descriptions: {
        dailyUsers: 'Zeigt die Sitzungsanzahl der letzten 7 Tage',
        monthlyUsers: 'Zeigt die Sitzungsanzahl der letzten 12 Monate',
        languageDistribution: 'Verteilung der Gespräche nach Sprache',
        messageCount:
          'Durchschnittliche Anzahl der Nachrichten pro Gespräch in den letzten 30 Tagen',
        topLanguagesShown: 'Top {count} angezeigt',
      },
    },
    languages: {
      en: 'Englisch',
      es: 'Spanisch',
      fr: 'Französisch',
      de: 'Deutsch',
      it: 'Italienisch',
      pt: 'Portugiesisch',
      nl: 'Niederländisch',
      ru: 'Russisch',
      ja: 'Japanisch',
      ko: 'Koreanisch',
      zh: 'Chinesisch',
      ar: 'Arabisch',
      hi: 'Hindi',
      tr: 'Türkisch',
      pl: 'Polnisch',
      vi: 'Vietnamesisch',
      th: 'Thailändisch',
      sv: 'Schwedisch',
      da: 'Dänisch',
      fi: 'Finnisch',
      no: 'Norwegisch',
      cs: 'Tschechisch',
      el: 'Griechisch',
      he: 'Hebräisch',
      ro: 'Rumänisch',
      hu: 'Ungarisch',
      uk: 'Ukrainisch',
      id: 'Indonesisch',
      ms: 'Malaiisch',
      fil: 'Filipino',
      bn: 'Bengalisch',
      fa: 'Persisch',
      so: 'Somali',
      mul: 'Mehrere Sprachen',
    },
  },
} as const

// Type helpers
export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en
