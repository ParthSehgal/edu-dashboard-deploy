#include<bits/stdc++.h>
using namespace std;

struct TrieNode {
    TrieNode* children[26];
    bool isEndOfWord;
    string fullName;   

    TrieNode() {
        isEndOfWord = false;
        fullName = "";
        for (int i = 0; i < 26; i++) {
            children[i] = nullptr;
        }
    }
};

class Trie {
private:
    TrieNode* root;

    void collectAll(TrieNode* node, vector<string>& results) {
        if (node == nullptr) return;

        if (node->isEndOfWord) {
            results.push_back(node->fullName);
        }

        for (int i = 0; i < 26; i++) {
            if (node->children[i] != nullptr) {
                collectAll(node->children[i], results);
            }
        }
    }

public:
    Trie() {
        root = new TrieNode();
    }

    void insert(const string& name) {
        string lower = name;
        transform(lower.begin(), lower.end(), lower.begin(), ::tolower);

        TrieNode* curr = root;

        for (char c : lower) {
            if (c < 'a' || c > 'z') continue;  
            int index = c - 'a';
            if (curr->children[index] == nullptr) {
                curr->children[index] = new TrieNode();
            }
            curr = curr->children[index];
        }

        curr->isEndOfWord = true;
        curr->fullName = name;   
    }

    vector<string> search(const string& prefix) {
        string lower = prefix;
        transform(lower.begin(), lower.end(), lower.begin(), ::tolower);

        TrieNode* curr = root;
        vector<string> results;

        for (char c : lower) {
            if (c < 'a' || c > 'z') continue;
            int index = c - 'a';
            if (curr->children[index] == nullptr) {
                return results;  
            }
            curr = curr->children[index];
        }


        collectAll(curr, results);
        return results;
    }
};


int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "Usage: ./trie_search <query> <name1> <name2> ..." << endl;
        return 1;
    }

    string query = argv[1];
    Trie trie;

    for (int i = 2; i < argc; i++) {
        trie.insert(argv[i]);
    }

    vector<string> results = trie.search(query);

    for (int i = 0; i < results.size(); i++) {
        if (i > 0) cout << ",";
        cout << results[i];
    }
    cout << endl;

    return 0;
}
