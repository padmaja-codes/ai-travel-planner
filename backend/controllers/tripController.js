const Trip = require('../models/Trip');

async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

exports.generateTrip = async (req, res) => {
  const { destination, durationDays, budgetTier, interests } = req.body;
  const userId = req.user.id;

  const prompt = `
    Create a detailed travel plan for a ${durationDays}-day trip to ${destination}.
    Budget preference is ${budgetTier}. Interests are: ${interests.join(', ')}.

    You must output ONLY a valid JSON object with this exact structure:
    {
      "itinerary": [
        {
          "dayNumber": 1,
          "activities": [
            { 
              "title": "Activity name", 
              "description": "Brief description", 
              "estimatedCostUSD": 20, 
              "timeOfDay": "Morning" 
            }
          ]
        }
      ],
      "hotels": [
        { 
          "name": "Hotel name", 
          "tier": "Budget", 
          "estimatedCostNightUSD": 50, 
          "rating": "4/5" 
        }
      ],
      "estimatedBudget": {
        "transport": 100,
        "accommodation": 200,
        "food": 150,
        "activities": 100,
        "total": 550
      },
      "packingList": [
        { 
          "item": "Passport", 
          "category": "Documents", 
          "isPacked": false 
        }
      ]
    }
    Make sure estimates match realistic local rates for ${budgetTier} budget.
    Make sure timeOfDay is only Morning, Afternoon or Evening.
    Make sure category is only Documents, Clothing, Gear or Other.
    Output ONLY the JSON, no extra text.
  `;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('No response from Gemini');
    }

    const cleanResult = JSON.parse(responseText);

    const newTrip = new Trip({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests,
      itinerary: cleanResult.itinerary,
      hotels: cleanResult.hotels,
      estimatedBudget: cleanResult.estimatedBudget,
      packingList: cleanResult.packingList
    });

    const savedTrip = await newTrip.save();
    return res.status(201).json(savedTrip);

  } catch (error) {
    console.error('AI Generation Error:', error);
    return res.status(500).json({ message: 'Error generating trip. Please try again.' });
  }
};

exports.getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.regenerateDay = async (req, res) => {
  const { dayNumber, feedback } = req.body;

  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const prompt = `
      Regenerate Day ${dayNumber} of a trip to ${trip.destination}.
      Budget: ${trip.budgetTier}. Interests: ${trip.interests.join(', ')}.
      User feedback: ${feedback || 'Make it more interesting'}.
      
      Output ONLY a valid JSON object with this structure:
      {
        "dayNumber": ${dayNumber},
        "activities": [
          {
            "title": "Activity name",
            "description": "Brief description",
            "estimatedCostUSD": 20,
            "timeOfDay": "Morning"
          }
        ]
      }
      Make sure timeOfDay is only Morning, Afternoon or Evening.
      Output ONLY the JSON, no extra text.
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const newDay = JSON.parse(responseText);

    trip.itinerary = trip.itinerary.map(day =>
      day.dayNumber === dayNumber ? newDay : day
    );

    await trip.save();
    res.json(trip);

  } catch (error) {
    console.error('Regenerate Day Error:', error);
    res.status(500).json({ message: 'Error regenerating day. Please try again.' });
  }
};
