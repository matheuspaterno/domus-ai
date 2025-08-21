# Domus AI

Domus AI is a web application designed to provide powerful real estate insights through intelligent automation and research. This project integrates OpenAI's API to offer users an interactive experience with various features related to property research and market analysis.

## Features

- **LLM Chat Box**: Engage with Domus AI to ask questions about property research, such as "What are the steps in researching a foreclosure?" or "What’s a lien check?" The chat box utilizes OpenAI's API to provide informative responses.

- **AI-Powered Market Snapshot**: Users can inquire about market trends, for example, "What’s the market trend in Miami this month?" The system generates a short analysis based on mock or public data.

- **Smart Property Analyzer**: Users can paste property listing URLs or enter ZIP codes to receive a brief analysis, such as average prices and important factors to consider.

- **AI Glossary / Explainer**: An interactive section where users can type in real estate terms (e.g., title search, foreclosure, lien, escrow) and receive clear explanations in plain English.

## Getting Started

To get started with the Domus AI project, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/domus-ai.git
   cd domus-ai
   ```

2. **Install Dependencies**:
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the Development Server**:
   Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.