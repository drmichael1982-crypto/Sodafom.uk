import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Blackboard } from '@/components/Blackboard';
import MuseumWalkthrough from '@/components/museum/MuseumWalkthrough';
vi.mock('@/components/ArchieCharacter', () => ({ ArchieCharacter: () => <span>Archie</span> }));
const base = { subject:'Maths', topicTitle:'Counting adventure', mode:'question' as const, explanationText:'Count the shells.', questionText:'How many?', progressPercent:25 };
describe('colourful classroom controls', () => {
  it('preserves the selected answer callback and semantic state', () => {
    const onOptionSelect = vi.fn();
    render(<Blackboard {...base} options={['Two','Three']} selectedOption="Three" onOptionSelect={onOptionSelect} />);
    fireEvent.click(screen.getByRole('button',{name:'Two'}));
    expect(onOptionSelect).toHaveBeenCalledWith('Two');
    expect(screen.getByRole('button',{name:'Three'})).toHaveAttribute('aria-pressed','true');
  });
  it('supports typed answers and blocks empty submissions', () => {
    const submit = vi.fn();
    const { rerender } = render(<Blackboard {...base} typedInput="" onSubmitAnswer={submit} />);
    expect(screen.getByRole('button',{name:'Check answer'})).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('textbox',{name:'Your answer'}),{key:'Enter'});
    expect(submit).not.toHaveBeenCalled();
    rerender(<Blackboard {...base} typedInput="three" onSubmitAnswer={submit} />);
    fireEvent.keyDown(screen.getByRole('textbox',{name:'Your answer'}),{key:'Enter'});
    expect(submit).toHaveBeenCalledTimes(1);
  });
  it('clamps progress and keeps hint, feedback and example readable', () => {
    render(<Blackboard {...base} progressPercent={150} hintText="Try counting slowly." exampleText="One shell and one shell make two." feedback={{isCorrect:false,message:'Good try!'}} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value','100');
    expect(screen.getByText('Try counting slowly.')).toBeVisible();
    expect(screen.getByText('One shell and one shell make two.')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Good try!');
  });
});
describe('walk-through museum', () => {
  it('enters, opens a gallery and exhibit, reads it, and returns to the hall', () => {
    const read = vi.fn();
    function Harness() {
      const [selectedKey,setKey] = useState<string|null>(null);
      const [selectedExhibit,setExhibit] = useState<number|null>(null);
      return <MuseumWalkthrough galleries={{dino:{title:'Dinosaur Museum',icon:'🦖',colour:'',welcome:'Welcome to fossils.',artefacts:[{name:'Fossil hall',icon:'🦴',fact:'Fossils are clues.',challenge:'What do you notice?'}]}}}
        selectedKey={selectedKey} selectedExhibit={selectedExhibit} query="" message="Welcome" onQueryChange={()=>{}} onSearch={()=>{}}
        onEnter={setKey} onBack={()=>{setKey(null);setExhibit(null);}} onExhibit={setExhibit} onRead={read} />;
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole('button',{name:/Enter the museum/}));
    fireEvent.click(screen.getByRole('button',{name:/Dinosaur Museum/}));
    fireEvent.click(screen.getByRole('button',{name:'Fossil hall'}));
    expect(screen.getByText('Fossils are clues.')).toBeVisible();
    fireEvent.click(screen.getByRole('button',{name:/Read/}));
    expect(read).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'Museum hall'}));
    expect(screen.getByRole('button',{name:/Dinosaur Museum/})).toBeVisible();
  });
});
