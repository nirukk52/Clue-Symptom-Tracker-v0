{
  "contract_reference": {
    "mood": {
      "storage": ["mood_logs"],
      "timeline": ["timeline_entries:type=mood"],
      "graph": ["graph_nodes:type=factor label=Mood"],
      "canvas": "Applicable. Mood creates a factor node that should be visible through /api/graph and the canvas accessibility labels."
    },
    "medications": {
      "storage": ["medication_logs"],
      "timeline": ["timeline_entries:type=medication"],
      "graph": ["graph_nodes:type=medication"],
      "canvas": "Applicable. Medications create graph medication nodes and should surface on the canvas."
    },
    "factors": {
      "storage": ["factor_logs"],
      "timeline": ["timeline_entries:type=factor"],
      "graph": ["graph_nodes:type=factor"],
      "canvas": "Applicable. Sleep and other-factor rows create factor nodes that should surface on the canvas."
    },
    "measurements": {
      "storage": ["health_measurement_logs"],
      "timeline": ["timeline_entries:type=measurement"],
      "graph": [],
      "canvas": "Not applicable today. Measurements persist to storage and timeline but do not create graph nodes."
    }
  },
  "test_scenarios": [
    {
      "scenario_id": "quick_entry_full_screen_smoke",
      "test_user_email": "quick_entry_full_screen_smoke@gmail.com",
      "description": "Logs one mood, medication, sleep factor, other factor, and measurement from the quick-entry screen, then verifies storage, graph, and canvas state.",
      "quick_entry_input": {
        "mood": {
          "rating": 8,
          "note": "Felt steadier after resting."
        },
        "medications": [
          {
            "name": "Vitamin D",
            "strength": "1000",
            "unit": "mg"
          }
        ],
        "factors": [
          {
            "card": "sleep",
            "label": "Sleep Quality",
            "intensity": "medium"
          },
          {
            "card": "other",
            "category": "Lifestyle",
            "label": "Caffeine",
            "intensity": "high"
          }
        ],
        "measurements": [
          {
            "label": "Heart Rate",
            "value": "82",
            "notes": "After coffee"
          }
        ]
      },
      "expected_state": {
        "storage": {
          "mood": {
            "rating": 8,
            "note": "Felt steadier after resting."
          },
          "medications": [
            {
              "label": "Vitamin D",
              "dosage": "1000 mg"
            }
          ],
          "factors": [
            {
              "label": "Sleep Quality",
              "categoryLabel": "Sleep",
              "rating": 2,
              "scaleMax": 3
            },
            {
              "label": "Caffeine",
              "categoryLabel": "Lifestyle",
              "rating": 3,
              "scaleMax": 3
            }
          ],
          "measurements": [
            {
              "label": "Heart Rate",
              "value": 82,
              "unit": "bpm",
              "notes": "After coffee"
            }
          ]
        },
        "timeline": {
          "mood": {
            "label": "Mood 8/10",
            "descriptionIncludes": "Felt steadier after resting."
          },
          "medications": [
            {
              "label": "Vitamin D",
              "descriptionIncludes": "1000 mg"
            }
          ],
          "factors": [
            {
              "label": "Sleep Quality",
              "descriptionIncludes": "Sleep"
            },
            {
              "label": "Caffeine",
              "descriptionIncludes": "Lifestyle"
            }
          ],
          "measurements": [
            {
              "label": "Heart Rate",
              "descriptionIncludes": "82 bpm"
            }
          ]
        },
        "graph": {
          "factor": [
            {
              "label": "Mood"
            },
            {
              "label": "Sleep Quality"
            },
            {
              "label": "Caffeine"
            }
          ],
          "medication": [
            {
              "label": "Vitamin D"
            }
          ],
          "forbidLabels": [
            {
              "label": "Heart Rate"
            }
          ]
        },
        "canvas": {
          "presentLabels": [
            {
              "label": "Mood"
            },
            {
              "label": "Sleep Quality"
            },
            {
              "label": "Caffeine"
            },
            {
              "label": "Vitamin D"
            }
          ]
        }
      }
    },
    {
      "scenario_id": "quick_entry_mood_canvas_node",
      "test_user_email": "quick_entry_mood_canvas_node@gmail.com",
      "description": "Verifies that the mood card writes mood storage, a mood timeline entry, and the Mood factor node for the canvas.",
      "quick_entry_input": {
        "mood": {
          "rating": 6,
          "note": "Mood improved after lunch."
        }
      },
      "expected_state": {
        "storage": {
          "mood": {
            "rating": 6,
            "note": "Mood improved after lunch."
          }
        },
        "timeline": {
          "mood": {
            "label": "Mood 6/10",
            "descriptionIncludes": "Mood improved after lunch."
          }
        },
        "graph": {
          "factor": [
            {
              "label": "Mood"
            }
          ]
        },
        "canvas": {
          "presentLabels": [
            {
              "label": "Mood"
            }
          ]
        }
      }
    },
    {
      "scenario_id": "quick_entry_medication_canvas_node",
      "test_user_email": "quick_entry_medication_canvas_node@gmail.com",
      "description": "Verifies that the medication card writes medication storage, timeline state, and a medication graph node visible on the canvas.",
      "quick_entry_input": {
        "medications": [
          {
            "name": "Bactrim",
            "strength": "500",
            "unit": "mg"
          }
        ]
      },
      "expected_state": {
        "storage": {
          "medications": [
            {
              "label": "Bactrim",
              "dosage": "500 mg"
            }
          ]
        },
        "timeline": {
          "medications": [
            {
              "label": "Bactrim",
              "descriptionIncludes": "500 mg"
            }
          ]
        },
        "graph": {
          "medication": [
            {
              "label": "Bactrim"
            }
          ]
        },
        "canvas": {
          "presentLabels": [
            {
              "label": "Bactrim"
            }
          ]
        }
      }
    },
    {
      "scenario_id": "quick_entry_factor_canvas_nodes",
      "test_user_email": "quick_entry_factor_canvas_nodes@gmail.com",
      "description": "Verifies that sleep and other-factor cards create factor logs, factor timeline rows, and factor graph nodes visible on the canvas.",
      "quick_entry_input": {
        "factors": [
          {
            "card": "sleep",
            "label": "Sleep Quality",
            "intensity": "high"
          },
          {
            "card": "other",
            "category": "Lifestyle",
            "label": "Hydration",
            "intensity": "medium"
          }
        ]
      },
      "expected_state": {
        "storage": {
          "factors": [
            {
              "label": "Sleep Quality",
              "categoryLabel": "Sleep",
              "rating": 3,
              "scaleMax": 3
            },
            {
              "label": "Hydration",
              "categoryLabel": "Lifestyle",
              "rating": 2,
              "scaleMax": 3
            }
          ]
        },
        "timeline": {
          "factors": [
            {
              "label": "Sleep Quality",
              "descriptionIncludes": "Sleep"
            },
            {
              "label": "Hydration",
              "descriptionIncludes": "Lifestyle"
            }
          ]
        },
        "graph": {
          "factor": [
            {
              "label": "Sleep Quality"
            },
            {
              "label": "Hydration"
            }
          ]
        },
        "canvas": {
          "presentLabels": [
            {
              "label": "Sleep Quality"
            },
            {
              "label": "Hydration"
            }
          ]
        }
      }
    },
    {
      "scenario_id": "quick_entry_measurement_storage_only",
      "test_user_email": "quick_entry_measurement_storage_only@gmail.com",
      "description": "Verifies that measurements save to storage and timeline while remaining absent from the graph and canvas contract.",
      "quick_entry_input": {
        "measurements": [
          {
            "label": "Heart Rate",
            "value": "78",
            "notes": "Before breakfast"
          }
        ]
      },
      "expected_state": {
        "storage": {
          "measurements": [
            {
              "label": "Heart Rate",
              "value": 78,
              "unit": "bpm",
              "notes": "Before breakfast"
            }
          ]
        },
        "timeline": {
          "measurements": [
            {
              "label": "Heart Rate",
              "descriptionIncludes": "78 bpm"
            }
          ]
        },
        "graph": {
          "forbidLabels": [
            {
              "label": "Heart Rate"
            }
          ]
        },
        "canvas": {
          "notApplicable": true,
          "reason": "Measurements persist to storage and timeline only; they do not create graph nodes today."
        }
      }
    }
  ]
}
