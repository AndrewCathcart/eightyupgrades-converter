import type { NextPage } from 'next';
import { FormEvent, useState } from 'react';

const DB_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(
  'https://wotlkdb.com/?spell='
)}`;

type EightyUpgradesExportData = {
  items: [
    {
      id: number;
      enchant?: {
        id: number;
        itemId: number;
        spellId: number;
      };
      gems?: [
        {
          id: number;
        }
      ];
    }
  ];
  glyphs?: [
    {
      id: number;
    }
  ];
};

const Home: NextPage = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleConvert = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;
    setOutput('');

    const values: Record<string, number> = {};
    const add = (id: number) => {
      if (!values[id]) {
        values[id] = 1;
      } else {
        values[id]++;
      }
    };

    const data: EightyUpgradesExportData = JSON.parse(input);
    for (const item of data.items) {
      if (item.id) {
        add(item.id);
      }

      (item.gems || []).map((gem: any) => {
        if (gem?.id) {
          add(gem.id);
        }
      });

      if (item.enchant) {
        if (item.enchant.itemId) {
          add(item.enchant.itemId);
        } else {
          try {
            const response = await fetch(`${DB_URL}${item.enchant.spellId}`);
            const body = await response.text();
            const substr = body.substr(body.indexOf('Scroll of') - 70, 65);
            const matches = substr.match(/\[(.*?)\]/);
            const id = matches ? matches[1] : null;
            if (id && !isNaN(+id)) {
              add(+id);
            }
          } catch (err) {
            console.warn(`Could not fetch ${item.enchant.spellId}`, err);
          }
        }
      }
    }

    (data.glyphs || []).map((glyph: any) => {
      add(glyph.id);
    });

    let copyString = `-- belt buckle and bags\n.additem 23162 4\n.additem 41611 1\n\n`;
    copyString = copyString.concat(
      '-- gnomish cloaking device\n.additem 4397\n\n',
      '-- reputations\n.modify reputation 1119 exalted\n.modify reputation 1098 exalted\n.modify reputation 1090 exalted\n.modify reputation 1091 exalted\n\n',
      '-- mats for nitro boots & frag bet & hyperspeed accel\n.additem 6219\n.additem 36916 8\n.additem 39690 14\n.additem 39681 6\n.additem 36913 6\n.additem 37700 4\n\n'
    );
    const keys = Object.keys(values);

    let lines = 0;

    keys.map((key) => {
      copyString = `${copyString}${
        lines > 0 && lines % 14 === 0 ? '\n' : ''
      }.additem ${key} ${values[key]}\n`;
      lines++;
    });

    setOutput(copyString);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <>
      <title>Eighty Upgrades Converter</title>
      <div className='grid w-full grid-cols-2 gap-2 p-4'>
        <form id='form' onSubmit={handleConvert}>
          <textarea
            className='w-full appearance-none resize-none h-[80vh] border-black border-2'
            id='input'
            placeholder='Paste export string here...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className='px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700'>
            Convert
          </button>
        </form>

        <div>
          <textarea
            className='w-full appearance-none resize-none h-[80vh] border-black border-2'
            name='output'
            id='output'
            value={output}
            readOnly={true}
          />
          <button
            className='px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700'
            id='copy'
            onClick={handleCopyToClipboard}
          >
            Copy to clipboard
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
