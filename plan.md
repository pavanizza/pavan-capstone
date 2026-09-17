# Capstone Project Plan

## Project Overview

I am building an **AI-powered calorie and macro tracking assistant** that makes nutrition tracking easier and more personalized.

Traditional calorie-tracking apps require users to manually search for foods, enter quantities, calculate macros, and then figure out what they should eat next. This can make tracking time-consuming and difficult to maintain.

My project aims to simplify this process by allowing users to log their meals naturally, such as:

> "I had 2 rotis, paneer curry and a bowl of curd."

The AI will interpret the meal, estimate its calories and macronutrients, update the user's daily nutrition intake, and analyze what nutrients and calories are still required.

The core feature is a **next-meal recommendation agent**. Instead of only telling the user how many calories they have consumed, the system will suggest an ideal next meal based on their remaining calories and macros, dietary preferences, goals, and previous meals.

The overall concept is:

> **Log what you ate. The AI tracks it and tells you what to eat next.**

---

## Scope Breakdown

### MVP Scope (Minimum Viable Product)

* **User nutrition profile**

  * Allow users to enter basic information such as age, height, weight, activity level, goal, and dietary preference.
  * Use this information to estimate daily calorie and macronutrient targets.

* **Natural-language meal logging**

  * Allow users to describe what they ate in normal language instead of manually searching through a food database.
  * Example: "I had 3 eggs, 2 slices of toast and a banana."

* **AI food and macro estimation**

  * Use AI to identify foods and estimate appropriate serving sizes when exact quantities are not provided.
  * Calculate estimated calories, protein, carbohydrates, and fats for each meal.

* **Daily calorie and macro tracker**

  * Track calories and macros consumed throughout the day.
  * Display remaining calories, protein, carbohydrates, and fats relative to the user's daily targets.

* **Next-meal recommendation agent**

  * Analyze the user's current nutritional state after each meal.
  * Identify the main nutritional gap.
  * Recommend a suitable next meal that fits the user's remaining calorie and macro requirements.

* **Basic user interface**

  * Provide a simple dashboard showing daily calorie and macro progress.
  * Provide a meal logging interface.
  * Display the AI-generated next-meal recommendation.

* **Basic AI-agent workflow**

  * The AI will interpret the user's meal input, interact with the nutrition/calculation functions, update the user's nutritional state, and generate the next-meal recommendation.

---

### Final Goals (Post-MVP)

* **Multimodal meal logging**

  * Allow users to upload a picture of their meal and use AI to identify foods and estimate portions.
  * Add voice-based meal logging.

* **Personalized meal recommendations**

  * Learn the user's food preferences, frequently consumed meals, dislikes, dietary restrictions, and eating patterns.
  * Make recommendations increasingly personalized over time.

* **Ingredient-based recommendations**

  * Allow users to enter ingredients available at home.
  * Recommend a meal that uses those ingredients while fitting the user's remaining macros.

* **Expanded food database**

  * Support a wider range of Indian, international, homemade, packaged, and restaurant foods.
  * Allow users to create and save custom meals.

* **User authentication and database integration**

  * Add secure user accounts.
  * Store meal history, nutrition targets, preferences, and progress.

* **Daily and weekly insights**

  * Show trends in calorie and macro intake.
  * Identify recurring patterns such as consistently low protein intake or frequent calorie overages.

* **Improved UI and user experience**

  * Add visual progress tracking, meal history, recommendation cards, and a more conversational interface.

* **Public deployment**

  * Deploy the application so it can be accessed and tested through the web.

* **Future integrations**

  * Explore integrations with fitness trackers, activity data, restaurant menus, and grocery/meal-planning services.

---

## AI-Involvement Level

* **Target Level:** Level 3 — AI-Augmented Application / Agentic AI

* **Rationale:**
  AI will be a central component of the application rather than being used only as a coding assistant or simple chatbot.

  The AI will be responsible for understanding natural-language meal descriptions, identifying foods, estimating portions, interpreting the user's current nutritional state, identifying nutritional gaps, and generating personalized next-meal recommendations.

  The system will use an agentic workflow in which the AI can interact with application tools such as food-nutrition lookup, meal logging, daily nutrition tracking, macro calculation, and meal recommendation functions.

  Deterministic calculations such as BMR, TDEE, calorie targets, macro totals, and remaining calories will be handled through application code to improve reliability rather than relying entirely on the language model.

  AI will therefore function as the **reasoning and orchestration layer**, while the application's backend and database will manage structured nutritional data and calculations.

  I will use AI tools such as Claude for code generation, debugging, development assistance, and architecture recommendations, while maintaining ownership of the product concept, system architecture, feature scope, core logic, and final implementation decisions.
