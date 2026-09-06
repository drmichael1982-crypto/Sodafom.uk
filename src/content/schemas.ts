import { z } from 'zod';
export const schemas = {
  pages: {
    home: z.object({
      "STAR_DECO": z.array(z.object({
        "top": z.string(),
        "left": z.string().optional(),
        "right": z.string().optional(),
        "size": z.number(),
        "delay": z.number(),
        "id": z.string()
      }))
    }),
    subjects: z.object({
      "hero": z.object({
        "headline": z.string(),
        "tagline": z.string()
      }),
      "ageGroups": z.array(z.object({
        "id": z.string(),
        "range": z.string(),
        "label": z.string(),
        "emoji": z.string(),
        "color": z.string()
      })),
      "subjects": z.array(z.object({
        "id": z.string(),
        "title": z.string(),
        "emoji": z.string(),
        "color": z.string(),
        "description": z.string(),
        "readAloud": z.boolean(),
        "categories": z.array(z.object({
          "id": z.string(),
          "title": z.string(),
          "icon": z.string(),
          "ageGroups": z.array(z.string()),
          "description": z.string(),
          "levels": z.array(z.string())
        }))
      }))
    }),
    games: z.object({
      "hero": z.object({
        "headline": z.string(),
        "tagline": z.string()
      }),
      "categories": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "emoji": z.string()
      })),
      "games": z.array(z.object({
        "id": z.string(),
        "title": z.string(),
        "subject": z.string(),
        "emoji": z.string(),
        "isNew": z.boolean().optional(),
        "description": z.string(),
        "ageGroups": z.array(z.string()),
        "difficulty": z.string(),
        "readAloud": z.boolean(),
        "featured": z.boolean(),
        "color": z.string(),
        "skills": z.array(z.string())
      })),
      "readAloudBanner": z.object({
        "headline": z.string(),
        "description": z.string()
      }),
      "weeklyChallenge": z.object({
        "gameId": z.string(),
        "title": z.string(),
        "emoji": z.string(),
        "tagline": z.string(),
        "prize": z.string()
      }).optional()
    }),
    pricing: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "subtext": z.string()
      }),
      "toggle": z.object({
        "monthly": z.string(),
        "annual": z.string(),
        "saveBadge": z.string()
      }),
      "plans": z.array(z.object({
        "id": z.string(),
        "name": z.string(),
        "emoji": z.string(),
        "monthlyPrice": z.string(),
        "annualPrice": z.string(),
        "period": z.string(),
        "description": z.string(),
        "cta": z.string(),
        "ctaHref": z.string(),
        "highlight": z.boolean(),
        "features": z.array(z.object({
          "id": z.string(),
          "text": z.string(),
          "included": z.boolean()
        }))
      })),
      "comparison": z.object({
        "headline": z.string(),
        "rows": z.array(z.object({
          "id": z.string(),
          "feature": z.string(),
          "free": z.string(),
          "family": z.string(),
          "school": z.string()
        }))
      }),
      "faqs": z.array(z.object({
        "id": z.string(),
        "question": z.string(),
        "answer": z.string()
      })),
      "guarantee": z.object({
        "headline": z.string(),
        "text": z.string()
      })
    }),
    app_download: z.object({
      "SCREENSHOTS": z.array(z.object({
        "emoji": z.string(),
        "label": z.string(),
        "color": z.string(),
        "id": z.string()
      })),
      "REVIEWS": z.array(z.object({
        "name": z.string(),
        "stars": z.number(),
        "text": z.string(),
        "id": z.string()
      })),
      "STEPS": z.array(z.object({
        "num": z.string(),
        "title": z.string(),
        "desc": z.string(),
        "id": z.string()
      }))
    }),
    contact: z.object({
      "ENQUIRY_TYPES": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      })),
      "FAQS": z.array(z.object({
        "q": z.string(),
        "a": z.string(),
        "id": z.string()
      }))
    }),
    founder: z.object({
      "name": z.string(),
      "role": z.string(),
      "tagline": z.string(),
      "story": z.string(),
      "mission": z.string(),
      "values": z.array(z.object({
        "id": z.string(),
        "emoji": z.string(),
        "label": z.string()
      }))
    }),
    parents: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subtext": z.string()
      }),
      "trustBadges": z.array(z.object({
        "id": z.string(),
        "emoji": z.string(),
        "label": z.string(),
        "detail": z.string()
      })),
      "howItHelps": z.object({
        "heading": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "emoji": z.string(),
          "title": z.string(),
          "body": z.string()
        }))
      }),
      "safetySection": z.object({
        "heading": z.string(),
        "points": z.array(z.object({
          "id": z.string(),
          "text": z.string()
        }))
      }),
      "faq": z.array(z.object({
        "id": z.string(),
        "question": z.string(),
        "answer": z.string()
      })),
      "cta": z.object({
        "headline": z.string(),
        "subtext": z.string(),
        "button": z.string()
      })
    }),
    demo: z.object({
      "FULL_FEATURES": z.array(z.string()),
      "dots": z.array(z.object({
        "top": z.string(),
        "left": z.string(),
        "id": z.string()
      }))
    }),
    subscribe: z.object({
      "FEATURES": z.array(z.string()),
      "days": z.array(z.string())
    }),
    story_writer: z.object({
      "BRUSH_SIZES": z.array(z.number())
    }),
    admin_panel: z.object({
      "TABS": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      }))
    }),
    _404: z.object({
      "QUICK_LINKS": z.array(z.object({
        "href": z.string(),
        "emoji": z.string(),
        "label": z.string(),
        "color": z.string(),
        "id": z.string()
      }))
    }),
    about: z.object({
      "VALUES": z.array(z.object({
        "colour": z.string(),
        "title": z.string(),
        "desc": z.string(),
        "id": z.string()
      })),
      "MILESTONES": z.array(z.object({
        "year": z.string(),
        "label": z.string(),
        "desc": z.string(),
        "id": z.string()
      })),
      "TEAM": z.array(z.object({
        "emoji": z.string(),
        "name": z.string(),
        "role": z.string(),
        "bio": z.string(),
        "id": z.string()
      })),
      "STATS": z.array(z.object({
        "value": z.string(),
        "label": z.string(),
        "emoji": z.string(),
        "id": z.string()
      })),
      "PRESS": z.array(z.object({
        "quote": z.string(),
        "source": z.string(),
        "id": z.string()
      }))
    }),
    badges: z.object({
      "CATEGORIES": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      }))
    }),
    back_to_school_shop: z.object({
      "hero": z.object({
        "badge": z.string(),
        "headline": z.string(),
        "subtext": z.string()
      }),
      "affiliateNotice": z.string(),
      "tipsHeadline": z.string(),
      "sodafomCta": z.object({
        "headline": z.string(),
        "body": z.string(),
        "primaryBtn": z.string(),
        "secondaryBtn": z.string()
      })
    }),
    archie_chat: z.object({
      "hero": z.object({
        "title": z.string(),
        "subtitle": z.string(),
        "description": z.string(),
        "tagline": z.string(),
        "disclaimer": z.string(),
        "inputPlaceholder": z.string(),
        "newChatLabel": z.string()
      }),
      "suggestions": z.array(z.object({
        "id": z.string(),
        "text": z.string()
      })),
      "seo": z.object({
        "title": z.string(),
        "description": z.string()
      })
    }),
    rewards: z.object({
      "seo": z.object({
        "title": z.string(),
        "description": z.string()
      }),
      "heading": z.string(),
      "subheading": z.string(),
      "starBank": z.object({
        "title": z.string(),
        "balanceLabel": z.string(),
        "starsUnit": z.string(),
        "howToTitle": z.string(),
        "milestoneReachedMsg": z.string(),
        "playGamesLabel": z.string(),
        "thanksTitle": z.string(),
        "thanksBody": z.string(),
        "codeFootnote": z.string(),
        "teaserTitle": z.string(),
        "teaserBody": z.string()
      }),
      "milestones": z.object({
        "title": z.string()
      }),
      "shop": z.object({
        "title": z.string()
      }),
      "noChildren": z.object({
        "heading": z.string(),
        "body": z.string(),
        "cta": z.string()
      })
    }),
    download: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "subtext": z.string(),
        "appStoreCta": z.string(),
        "playStoreCta": z.string(),
        "badge": z.string()
      }),
      "features": z.array(z.object({
        "id": z.string(),
        "emoji": z.string(),
        "title": z.string(),
        "description": z.string()
      })),
      "steps": z.object({
        "headline": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "number": z.string(),
          "title": z.string(),
          "description": z.string()
        }))
      }),
      "platforms": z.object({
        "headline": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "name": z.string(),
          "icon": z.string(),
          "detail": z.string()
        }))
      }),
      "cta": z.object({
        "headline": z.string(),
        "subtext": z.string(),
        "button": z.string()
      })
    }),
    star_bank: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subtext": z.string()
      }),
      "howToEarn": z.object({
        "headline": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "emoji": z.string(),
          "action": z.string(),
          "stars": z.string(),
          "detail": z.string()
        }))
      }),
      "milestones": z.array(z.object({
        "id": z.string(),
        "stars": z.number(),
        "reward": z.string(),
        "emoji": z.string()
      })),
      "cta": z.object({
        "headline": z.string(),
        "button": z.string(),
        "href": z.string()
      })
    }),
    battle: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "subtext": z.string()
      }),
      "howItWorks": z.array(z.object({
        "id": z.string(),
        "step": z.string(),
        "emoji": z.string(),
        "title": z.string(),
        "description": z.string()
      })),
      "rewards": z.object({
        "headline": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "emoji": z.string(),
          "title": z.string(),
          "reward": z.string()
        }))
      }),
      "cta": z.object({
        "headline": z.string(),
        "subtext": z.string(),
        "button": z.string(),
        "href": z.string()
      })
    }),
    onboarding: z.object({
      "AGE_GROUPS": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "emoji": z.string(),
        "description": z.string()
      })),
      "SUBJECTS": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "emoji": z.string(),
        "color": z.string()
      })),
      "AVATAR_EMOJIS": z.array(z.string())
    })
  },
  data: {
    blog_posts: z.array(z.object({
      "id": z.string(),
      "slug": z.string(),
      "title": z.string(),
      "excerpt": z.string(),
      "category": z.string(),
      "readTime": z.string(),
      "publishedAt": z.string(),
      "emoji": z.string(),
      "body": z.array(z.object({
        "id": z.string(),
        "text": z.string()
      }))
    }))
  }
};
export type Schemas = typeof schemas;